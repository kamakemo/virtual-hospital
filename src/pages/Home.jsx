import React from 'react';
import { HOSPITALS, CENTRES, COUNTS, SECTION_BY_ID } from '../data/catalog.js';
import { useApp, Hero } from '../App.jsx';
import Art from '../components/Art.jsx';

export default function Home() {
  const { content } = useApp();
  const [cardio, im] = HOSPITALS;
  const [conf, tests] = CENTRES;
  const ready = Object.keys(content).length;
  return (
    <>
      <Hero id="home-hero" color="#C4122F" icon="🫀" title="Our mission" light="to train the doctors who keep hearts — and patients — alive"
        sub={`${COUNTS.units} clinical units · ${COUNTS.cases} cases · a Conference Centre and a Test Centre`}>
        <div className="hero-cta">
          <a className="btn" href="#/s/cardiology">Enter the Cardiology Hospital →</a>
          <a className="btn btn-white" href="#/s/internal">Enter the Internal Medicine Hospital →</a>
        </div>
      </Hero>

      <section className="wrap panel">
        <div className="feature-row">
          <a href={`#/s/${cardio.id}`} className="card card-dark">
            <Art id={cardio.id} color={cardio.color} icon={cardio.icon} dark />
            <div className="card-dark-copy">
              <span className="tag">🏥 Hospital</span>
              <h2>{cardio.name}: the whole ESC core curriculum, one case at a time</h2>
              <p>{cardio.units.length} units from the emergency department and coronary care to the cath lab, the echo lab and the device clinic — {cardio.units.length * 12} cases.</p>
              <span className="more">Read more →</span>
            </div>
          </a>
          <a href={`#/s/${im.id}`} className="card card-side">
            <div className="thumb"><Art id={im.id} color={im.color} icon={im.icon} /></div>
            <div>
              <h2>{im.name} opens all {im.units.length} specialties</h2>
              <p>From the acute medical take and intensive care to nephrology, endocrinology, neurology and palliative care — twelve cases in every unit.</p>
            </div>
            <span className="more">Read more →</span>
          </a>
        </div>
        <div className="card-row">
          {[
            { to: `#/s/${conf.id}`, id: conf.id, color: conf.color, icon: conf.icon, tag: 'Conference Centre', h: 'Grand rounds, guideline updates & masterclasses', p: `${conf.units.length} halls and ${COUNTS.sessions} sessions — from the latest ESC guidelines to landmark-trial journal clubs.` },
            { to: `#/s/${tests.id}`, id: tests.id, color: tests.color, icon: tests.icon, tag: 'Test Centre', h: 'Board simulators & question banks', p: `EEGC, MRCP, Arab Board and Fellowship mock exams, topic banks and skills tests — ${COUNTS.tests} in all.` },
            { to: '#/s/cardiology/c-img', id: 'c-img', color: '#0A6E8A', icon: '🖥️', tag: 'Cardiology · Imaging', h: 'The echo lab: from the systematic study to 3D', p: 'Twelve imaging cases: TTE, strain, diastology, the right heart, TOE, CMR, CT and nuclear.' },
            { to: '#/account', id: 'account', color: '#2B2B33', icon: '⚙️', tag: 'My account', h: `${ready} items published`, p: 'Sign in to open published cases. Administrators upload one HTML file per case, session or test.' },
          ].map(c => (
            <a key={c.tag} href={c.to} className="card card-img">
              <div className="thumb"><Art id={c.id} color={c.color} icon={c.icon} /></div>
              <span className="tag">{c.tag}</span>
              <h3>{c.h}</h3>
              <p>{c.p}</p>
              <span className="more">Read more →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-h"><h2><b>Our</b> hospitals</h2><p>Choose a unit — each one holds twelve cases.</p></div>
        {HOSPITALS.map(h => (
          <div key={h.id} className="unit-strip">
            <div className="unit-strip-h"><h3>{h.icon} {h.name}</h3><a className="pill-btn" href={`#/s/${h.id}`}>All {h.units.length} units →</a></div>
            <div className="unit-tiles">
              {h.units.map(u => <a key={u.id} href={`#/s/${h.id}/${u.id}`} className="unit-tile"><span>{u.icon}</span>{u.name}</a>)}
            </div>
          </div>
        ))}
      </section>

      <section className="stats">
        <div className="wrap stats-in">
          {[[COUNTS.units, 'clinical units'], [COUNTS.cases, 'cases'], [COUNTS.sessions, 'conference sessions'], [COUNTS.tests, 'tests & simulators'], [ready, 'published']].map(([n, l]) => (
            <div key={l}><b>{n}</b><span>{l}</span></div>
          ))}
        </div>
      </section>
    </>
  );
}

export { SECTION_BY_ID };
