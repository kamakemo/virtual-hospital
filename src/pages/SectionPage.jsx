import React from 'react';
import { useApp, Hero } from '../App.jsx';
import Glyph from '../components/Art.jsx';

const pad = n => String(n).padStart(2, '0');

export function Ring({ n, of = 12 }) {
  const r = 15, c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 40 40" aria-label={`${n} of ${of} ready`}>
      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--line)" strokeWidth="3" />
      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--c)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${c * n / of} ${c}`} transform="rotate(-90 20 20)" />
      <text x="20" y="24" textAnchor="middle">{n}</text>
    </svg>
  );
}

export default function SectionPage({ section }) {
  const { content } = useApp();
  const word = section.id === 'conference' ? 'hall' : section.id === 'tests' ? 'track' : 'unit';
  const per = section.id === 'conference' ? 'sessions' : section.id === 'tests' ? 'tests' : 'cases';
  const done = section.units.reduce((n, u) => n + u.items.filter(it => content[it.id]).length, 0);
  return (
    <>
      <Hero id={section.id} color={section.color} icon={section.icon} crumbs={[[section.name]]} title={section.name} light={section.tagline}
        sub={`${section.units.length} ${word}s · ${section.units.length * 12} ${per} · ${done} published`} />
      <section className="wrap sec" style={{ '--c': section.color }}>
        <div className="ugrid">
          {section.units.map((u, i) => {
            const n = u.items.filter(it => content[it.id]).length;
            return (
              <a key={u.id} href={`#/s/${section.id}/${u.id}`} className="ucard spot rise" style={{ '--i': i * 0.35 }}>
                <div className="ucard-top"><span className="mono">{word} {pad(i + 1)}</span><Ring n={n} /></div>
                <span className="ucard-ic">{u.icon}</span>
                <h3>{u.name}</h3>
                <p>{u.blurb}</p>
                <Glyph id={u.id} color={section.color} />
                <span className="ucard-go mono">12 {per} <em>→</em></span>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
