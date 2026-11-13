import React, { useState } from 'react';
import { HOSPITALS, CENTRES, COUNTS } from '../data/catalog.js';
import { useApp } from '../App.jsx';
import { Search } from '../components/Search.jsx';

const HERO = [
  { k: 'Cardiology Hospital', h: 'Sixteen units. The whole cardiology curriculum.', p: 'From the chest-pain door and the coronary care unit to the cath lab, the echo lab and the device clinic — every topic of the ESC core curriculum as a case.', to: '#/s/cardiology', c: '#C8102E' },
  { k: 'Internal Medicine Hospital', h: 'Every specialty of internal medicine, case by case.', p: 'The acute take, intensive care and fifteen specialty units, each with twelve cases built around the problems physicians meet every day.', to: '#/s/internal', c: '#0067B1' },
  { k: 'Conference & Test Centres', h: 'Learn together. Then prove it.', p: 'Grand rounds, guideline updates and masterclasses in the Conference Centre; board simulators and question banks in the Test Centre.', to: '#/s/conference', c: '#7A3E9D' },
];

export default function Home() {
  const { content } = useApp();
  const [slide, setSlide] = useState(0);
  const s = HERO[slide];
  const ready = Object.keys(content).length;
  return (
    <>
      <section className="hero" style={{ '--c': s.c }}>
        <div className="hero-art" aria-hidden="true">
          <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
            <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0A2A5E" /><stop offset="1" stopColor="#061A3A" /></linearGradient></defs>
            <rect width="800" height="400" fill="url(#hg)" />
            {[...Array(9)].map((_, i) => <circle key={i} cx={560 + (i % 3) * 70} cy={90 + Math.floor(i / 3) * 90} r={26 + (i % 2) * 8} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />)}
            <path className="hero-ecg" d="M0 250 H220 l18 -60 20 120 18 -150 22 170 16 -80 H430 l14 -30 14 30 H560 l18 -60 20 120 18 -150 22 170 16 -80 H800" fill="none" stroke="var(--c)" strokeWidth="4" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="wrap hero-in">
          <span className="kicker">{s.k}</span>
          <h1>{s.h}</h1>
          <p>{s.p}</p>
          <div className="hero-cta">
            <a className="btn btn-red" href={s.to}>Explore →</a>
            <a className="btn btn-ghost" href="#/account">My account</a>
          </div>
          <div className="hero-dots" role="tablist">
            {HERO.map((x, i) => <button key={i} role="tab" aria-selected={i === slide} aria-label={x.k} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} />)}
          </div>
        </div>
      </section>

      <section className="band-search">
        <div className="wrap"><Search /></div>
      </section>

      <section className="wrap sec">
        <div className="sec-h"><h2>Our hospitals</h2><p>Choose a hospital, walk into a unit and pick one of its twelve cases.</p></div>
        <div className="hosp-grid">
          {HOSPITALS.map(h => (
            <a key={h.id} href={`#/s/${h.id}`} className="hosp" style={{ '--c': h.color }}>
              <div className="hosp-top"><span className="hosp-ic">{h.icon}</span><span className="hosp-n">{h.units.length} units · {h.units.length * 12} cases</span></div>
              <h3>{h.name}</h3>
              <p>{h.tagline}</p>
              <ul>{h.units.slice(0, 8).map(u => <li key={u.id}>{u.icon} {u.name}</li>)}<li className="more">+ {h.units.length - 8} more units</li></ul>
              <span className="hosp-go">Enter the {h.short.toLowerCase()} hospital →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="wrap stats-in">
          {[[COUNTS.units, 'clinical units'], [COUNTS.cases, 'case titles'], [COUNTS.sessions, 'conference sessions'], [COUNTS.tests, 'tests & simulators'], [ready, 'items published']].map(([n, l]) => (
            <div key={l}><b>{n}</b><span>{l}</span></div>
          ))}
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-h"><h2>Centres</h2><p>Beyond the wards.</p></div>
        <div className="centre-grid">
          {CENTRES.map(c => (
            <a key={c.id} href={`#/s/${c.id}`} className="centre" style={{ '--c': c.color }}>
              <span className="centre-ic">{c.icon}</span>
              <div>
                <h3>{c.name}</h3>
                <p>{c.tagline}</p>
                <div className="chips">{c.units.map(u => <span key={u.id} className="chip">{u.icon} {u.name}</span>)}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-h"><h2>Explore by unit</h2><p>Every unit of both hospitals.</p></div>
        {HOSPITALS.map(h => (
          <div key={h.id} className="unit-strip">
            <h3 style={{ color: h.color }}>{h.icon} {h.name}</h3>
            <div className="unit-tiles">
              {h.units.map(u => <a key={u.id} href={`#/s/${h.id}/${u.id}`} className="unit-tile" style={{ '--c': h.color }}><span>{u.icon}</span>{u.name}</a>)}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
