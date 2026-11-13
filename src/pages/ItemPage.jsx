import React, { useEffect, useState } from 'react';
import { useApp } from '../App.jsx';
import { SECTION_BY_ID, UNIT_BY_ID, itemWord } from '../data/catalog.js';
import { loadHtml } from '../supabaseClient.js';
import HtmlFrame from '../components/HtmlFrame.jsx';
import { Crumbs } from './SectionPage.jsx';

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
      <section className="page-hero small" style={{ '--c': section.color }}>
        <div className="wrap">
          <Crumbs items={[[section.name, `#/s/${section.id}`], [unit.name, `#/s/${section.id}/${unit.id}`], [`${itemWord(section.id)} ${item.n}`]]} />
          <div className="page-hero-in">
            <span className="page-ic">{unit.icon}</span>
            <div><h1>{title}</h1><p>{unit.name} · {itemWord(section.id)} {item.n} of 12</p></div>
          </div>
        </div>
      </section>
      <section className="wrap sec">
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
          {prev ? <a href={`#/item/${prev.id}`}>← {prev.title}</a> : <a href={`#/s/${section.id}/${unit.id}`}>← {unit.name}</a>}
          {next ? <a href={`#/item/${next.id}`}>{next.title} →</a> : <a href={`#/s/${section.id}/${unit.id}`}>{unit.name} →</a>}
        </div>
      </section>
    </>
  );
}
