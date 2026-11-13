import React from 'react';
import { useApp } from '../App.jsx';

export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <a href="#/">Home</a>
      {items.map(([label, href], i) => <React.Fragment key={i}><span>›</span>{href ? <a href={href}>{label}</a> : <b>{label}</b>}</React.Fragment>)}
    </nav>
  );
}

export default function SectionPage({ section }) {
  const { content } = useApp();
  const word = section.id === 'conference' ? 'halls' : section.id === 'tests' ? 'tracks' : 'units';
  const per = section.id === 'conference' ? 'sessions' : section.id === 'tests' ? 'tests' : 'cases';
  return (
    <>
      <section className="page-hero" style={{ '--c': section.color }}>
        <div className="wrap">
          <Crumbs items={[[section.name]]} />
          <div className="page-hero-in">
            <span className="page-ic">{section.icon}</span>
            <div>
              <h1>{section.name}</h1>
              <p>{section.tagline}</p>
              <span className="page-meta">{section.units.length} {word} · {section.units.length * 12} {per}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="wrap sec">
        <div className="unit-grid">
          {section.units.map(u => {
            const done = u.items.filter(it => content[it.id]).length;
            return (
              <a key={u.id} href={`#/s/${section.id}/${u.id}`} className="unit-card" style={{ '--c': section.color }}>
                <div className="unit-card-h"><span className="unit-ic">{u.icon}</span><span className={'pill' + (done ? ' pill-on' : '')}>{done}/12 ready</span></div>
                <h3>{u.name}</h3>
                <p>{u.blurb}</p>
                <ol>{u.items.slice(0, 4).map(it => <li key={it.id}>{it.title}</li>)}</ol>
                <span className="unit-go">Open the {word.slice(0, -1)} — 12 {per} →</span>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
