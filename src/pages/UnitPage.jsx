import React from 'react';
import { useApp, Hero } from '../App.jsx';
import { itemWord } from '../data/catalog.js';
import Art from '../components/Art.jsx';

export default function UnitPage({ section, unit }) {
  const { content } = useApp();
  const word = itemWord(section.id);
  const idx = section.units.indexOf(unit);
  const prev = section.units[idx - 1], next = section.units[idx + 1];
  const done = unit.items.filter(it => content[it.id]).length;
  return (
    <>
      <Hero id={unit.id + '-hero'} color={section.color} icon={unit.icon} current={section.id} small
        crumbs={[[section.name, `#/s/${section.id}`], [unit.name]]} title={unit.name} light={unit.blurb}
        sub={`12 ${word.toLowerCase()}s · ${done} published`} />
      <section className="wrap panel">
        <div className="case-grid">
          {unit.items.map(it => {
            const c = content[it.id];
            return (
              <a key={it.id} href={`#/item/${it.id}`} className={'card case-card' + (c ? ' ready' : '')}>
                <div className="thumb"><Art id={it.id} color={section.color} icon={unit.icon} /><span className="case-no">{String(it.n).padStart(2, '0')}</span></div>
                <span className="tag">{word} {it.n} · {c ? '▶ Open' : 'Coming soon'}</span>
                <h3>{c?.title || it.title}</h3>
                <span className="more">{c ? 'Open →' : 'View →'}</span>
              </a>
            );
          })}
        </div>
        <div className="pager">
          {prev ? <a className="pill-btn" href={`#/s/${section.id}/${prev.id}`}>← {prev.name}</a> : <span />}
          {next ? <a className="pill-btn" href={`#/s/${section.id}/${next.id}`}>{next.name} →</a> : <span />}
        </div>
      </section>
    </>
  );
}
