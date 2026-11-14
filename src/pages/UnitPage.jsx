import React from 'react';
import { useApp, Hero } from '../App.jsx';
import { itemWord } from '../data/catalog.js';
import Glyph from '../components/Art.jsx';

export default function UnitPage({ section, unit }) {
  const { content } = useApp();
  const word = itemWord(section.id);
  const idx = section.units.indexOf(unit);
  const prev = section.units[idx - 1], next = section.units[idx + 1];
  const done = unit.items.filter(it => content[it.id]).length;
  return (
    <>
      <Hero id={unit.id} color={section.color} icon={unit.icon} crumbs={[[section.name, `#/s/${section.id}`], [unit.name]]}
        title={unit.name} light={unit.blurb} sub={`12 ${word.toLowerCase()}s · ${done} published`} />
      <section className="wrap sec" style={{ '--c': section.color }}>
        <ol className="rows">
          {unit.items.map((it, i) => {
            const c = content[it.id];
            return (
              <li key={it.id} className="rise" style={{ '--i': i * 0.3 }}>
                <a href={`#/item/${it.id}`} className={'row case-row' + (c ? ' ready' : '')}>
                  <span className="row-n">{String(it.n).padStart(2, '0')}</span>
                  <span className="row-t"><small className="mono">{word} {it.n}</small>{c?.title || it.title}</span>
                  <Glyph id={it.id} color={section.color} />
                  <span className={'status mono' + (c ? ' on' : '')}><i />{c ? 'Open' : 'Coming soon'}</span>
                  <em>→</em>
                </a>
              </li>
            );
          })}
        </ol>
        <div className="pager">
          {prev ? <a className="btn btn-line" href={`#/s/${section.id}/${prev.id}`}>← {prev.name}</a> : <span />}
          {next ? <a className="btn btn-line" href={`#/s/${section.id}/${next.id}`}>{next.name} →</a> : <span />}
        </div>
      </section>
    </>
  );
}
