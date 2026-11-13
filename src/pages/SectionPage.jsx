import React from 'react';
import { useApp, Hero } from '../App.jsx';
import Art from '../components/Art.jsx';

export default function SectionPage({ section }) {
  const { content } = useApp();
  const word = section.id === 'conference' ? 'halls' : section.id === 'tests' ? 'tracks' : 'units';
  const per = section.id === 'conference' ? 'sessions' : section.id === 'tests' ? 'tests' : 'cases';
  const [first, ...rest] = section.units;
  const done = section.units.reduce((n, u) => n + u.items.filter(it => content[it.id]).length, 0);
  const firstDone = first.items.filter(it => content[it.id]).length;
  return (
    <>
      <Hero id={section.id + '-hero'} color={section.color} icon={section.icon} current={section.id}
        crumbs={[[section.name]]} title={section.name} light={section.tagline}
        sub={`${section.units.length} ${word} · ${section.units.length * 12} ${per} · ${done} published`} />

      <section className="wrap panel">
        <div className="feature-row">
          <a href={`#/s/${section.id}/${first.id}`} className="card card-dark">
            <Art id={first.id} color={section.color} icon={first.icon} dark />
            <div className="card-dark-copy">
              <span className="tag">{first.icon} {word.slice(0, -1)} 1 · {firstDone}/12 ready</span>
              <h2>{first.name}</h2>
              <p>{first.blurb}</p>
              <span className="more">Open the {word.slice(0, -1)} →</span>
            </div>
          </a>
          <div className="card card-list">
            <h3>{first.icon} Inside {first.name}</h3>
            <ol>{first.items.map(it => <li key={it.id}><a href={`#/item/${it.id}`}>{content[it.id]?.title || it.title}</a>{content[it.id] && <span className="dot-ok" title="Published" />}</li>)}</ol>
          </div>
        </div>
        <div className="card-row">
          {rest.map(u => {
            const n = u.items.filter(it => content[it.id]).length;
            return (
              <a key={u.id} href={`#/s/${section.id}/${u.id}`} className="card card-img">
                <div className="thumb"><Art id={u.id} color={section.color} icon={u.icon} /></div>
                <span className="tag">{n}/12 ready</span>
                <h3>{u.name}</h3>
                <p>{u.blurb}</p>
                <span className="more">Explore 12 {per} →</span>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
