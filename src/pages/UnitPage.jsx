import React from 'react';
import { useApp } from '../App.jsx';
import { itemWord } from '../data/catalog.js';
import { Crumbs } from './SectionPage.jsx';

export default function UnitPage({ section, unit }) {
  const { content } = useApp();
  const word = itemWord(section.id);
  const idx = section.units.indexOf(unit);
  const prev = section.units[idx - 1], next = section.units[idx + 1];
  return (
    <>
      <section className="page-hero small" style={{ '--c': section.color }}>
        <div className="wrap">
          <Crumbs items={[[section.name, `#/s/${section.id}`], [unit.name]]} />
          <div className="page-hero-in">
            <span className="page-ic">{unit.icon}</span>
            <div><h1>{unit.name}</h1><p>{unit.blurb}</p></div>
          </div>
        </div>
      </section>
      <section className="wrap sec">
        <ol className="case-list">
          {unit.items.map(it => {
            const c = content[it.id];
            return (
              <li key={it.id}>
                <a href={`#/item/${it.id}`} className={'case-row' + (c ? ' ready' : '')} style={{ '--c': section.color }}>
                  <span className="case-n">{String(it.n).padStart(2, '0')}</span>
                  <span className="case-t"><small>{word} {it.n}</small>{c?.title || it.title}</span>
                  <span className={'pill' + (c ? ' pill-on' : '')}>{c ? '▶ Open' : 'Coming soon'}</span>
                </a>
              </li>
            );
          })}
        </ol>
        <div className="pager">
          {prev ? <a href={`#/s/${section.id}/${prev.id}`}>← {prev.name}</a> : <span />}
          {next ? <a href={`#/s/${section.id}/${next.id}`}>{next.name} →</a> : <span />}
        </div>
      </section>
    </>
  );
}
