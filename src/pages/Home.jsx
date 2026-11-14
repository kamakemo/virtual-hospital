import React, { useState } from 'react';
import { HOSPITALS, CENTRES, COUNTS, UNIT_BY_ID } from '../data/catalog.js';
import { useApp } from '../App.jsx';
import Glyph from '../components/Art.jsx';
import Pulse from '../components/Pulse.jsx';

const pad = n => String(n).padStart(2, '0');

export default function Home() {
  const { content } = useApp();
  const [cardio, im] = HOSPITALS, [conf, tests] = CENTRES;
  const [dir, setDir] = useState(cardio.id);
  const h = HOSPITALS.find(x => x.id === dir);
  const ready = Object.keys(content).length;
  const ticker = Object.values(UNIT_BY_ID).map(u => u.name);
  return (
    <>
      <section className="hero">
        <div className="aura" style={{ '--c': 'var(--violet)' }} />
        <Pulse />
        <div className="wrap hero-in">
          <span className="eyebrow mono rise"><i />A teaching hospital that never closes</span>
          <h1 className="rise" style={{ '--i': 1 }}>Medicine,<br />learned at the <em>bedside</em>.</h1>
          <p className="rise" style={{ '--i': 2 }}>Two hospitals, {COUNTS.units} units and {COUNTS.cases} cases covering the whole cardiology and internal medicine curriculum — plus a conference centre and a test centre.</p>
          <div className="hero-cta rise" style={{ '--i': 3 }}>
            <a className="btn" href="#/s/cardiology">Start rounds →</a>
            <a className="btn btn-line" href="#/s/tests">Take a test</a>
          </div>
        </div>
        <div className="ticker mono" aria-hidden="true"><div>{[...ticker, ...ticker].map((t, i) => <span key={i}>{t}<i>✦</i></span>)}</div></div>
      </section>

      <section className="wrap sec">
        <header className="sec-h"><span className="mono">01 — The campus</span><h2>Two hospitals. <em>One</em> campus.</h2></header>
        <div className="bento">
          {[[cardio, 'b-a'], [im, 'b-b']].map(([s, cls]) => (
            <a key={s.id} href={`#/s/${s.id}`} className={'tile spot ' + cls} style={{ '--c': s.color }}>
              <div className="aura" />
              <span className="mono tile-k"><i />Hospital · {s.units.length} units · {s.units.length * 12} cases</span>
              <h3>{s.name}</h3>
              <p>{s.tagline}</p>
              <div className="tile-chips">{s.units.slice(0, 6).map(u => <span key={u.id}>{u.icon} {u.name}</span>)}<span>+{s.units.length - 6}</span></div>
              <Glyph id={s.id} color={s.color} />
              <span className="tile-go">↗</span>
            </a>
          ))}
          {[[conf, 'b-c'], [tests, 'b-d']].map(([s, cls]) => (
            <a key={s.id} href={`#/s/${s.id}`} className={'tile spot ' + cls} style={{ '--c': s.color }}>
              <div className="aura" />
              <span className="mono tile-k"><i />{s.units.length} {s.id === 'tests' ? 'tracks' : 'halls'} · 48 {s.id === 'tests' ? 'tests' : 'sessions'}</span>
              <h3>{s.name}</h3>
              <p>{s.tagline}</p>
              <Glyph id={s.id} color={s.color} />
              <span className="tile-go">↗</span>
            </a>
          ))}
          <div className="tile b-e">
            <span className="mono tile-k"><i />Live count</span>
            <div className="nums">
              <div><b>{COUNTS.units}</b><span>units</span></div>
              <div><b>{COUNTS.cases}</b><span>cases</span></div>
              <div><b>{COUNTS.sessions + COUNTS.tests}</b><span>sessions & tests</span></div>
              <div><b className="lime">{ready}</b><span>published</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <header className="sec-h">
          <span className="mono">02 — The directory</span>
          <h2>Every unit, <em>one</em> click away.</h2>
          <div className="seg">{HOSPITALS.map(x => <button key={x.id} className={dir === x.id ? 'on' : ''} style={{ '--c': x.color }} onClick={() => setDir(x.id)}><i />{x.short}</button>)}</div>
        </header>
        <ol className="dir" style={{ '--c': h.color }} key={h.id}>
          {h.units.map((u, i) => (
            <li key={u.id} className="rise" style={{ '--i': i * 0.4 }}>
              <a href={`#/s/${h.id}/${u.id}`}>
                <span className="mono">{pad(i + 1)}</span><span className="dir-ic">{u.icon}</span>
                <b>{u.name}</b><small>{u.blurb}</small><em>→</em>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap sec">
        <div className="cta spot">
          <div className="aura" style={{ '--c': 'var(--lime)' }} />
          <span className="mono">03 — Your move</span>
          <h2>Press <kbd>⌘K</kbd> and find any case in <em>seconds</em>.</h2>
          <div className="hero-cta"><a className="btn" href="#/account">Create your account →</a></div>
        </div>
      </section>
    </>
  );
}
