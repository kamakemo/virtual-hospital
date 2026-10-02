import React, { useMemo, useState } from 'react';
import { ArrowUpRight, BedDouble, ListOrdered, BookOpen } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import { Eyebrow, Divider, Breadcrumb, Progress, SearchField, EmptyState, cx } from '../ui/kit.jsx';
import { DEPT_BY_ID, roomFor } from '../data/curriculum.js';

function UnitCard({ unit, deptId, beds, libraryCount, doneCount, navigate }) {
  const open = beds > 0;
  const go = () => navigate({ name: 'unit', deptId, unitId: unit.id });

  return (
    <article
      className="group rounded-xl overflow-hidden bg-panel border border-line hover:border-accent/35 transition-colors flex flex-col"
      style={{ boxShadow: '0 1px 2px rgba(10,30,40,.04), 0 16px 34px -26px rgba(10,30,40,.4)' }}
    >
      {/* The room, seen through the door */}
      <button onClick={go} className="hero block w-full text-left" style={{ height: 112 }}>
        <img src={roomFor(unit)} alt="" className="hero__photo" aria-hidden="true"
          style={{ animation: 'none', transform: 'scale(1.05)' }} />
        <div className="hero__scrim" />
        <span className="hero__band" style={{ background: unit.hue }} />
        <span className="hero__inner absolute inset-x-0 bottom-0 px-4 pb-3 block">
          <span className="display text-[16.5px] leading-snug text-white block">{unit.label}</span>
        </span>
        <span className="hero__inner absolute top-3 right-3 label px-2 py-1 rounded"
          style={{ fontSize: 9, background: open ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.1)', color: '#fff' }}>
          {open ? `${beds} beds` : 'Open ward'}
        </span>
      </button>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[13px] text-ink-2 leading-relaxed mb-4">{unit.blurb}</p>

        <div className="mt-auto">
          <div className="flex items-center gap-3.5 text-[11.5px] text-ink-3 nums mb-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1"><ListOrdered size={11} />{unit.topics.length} topics</span>
            {open && <span className="inline-flex items-center gap-1"><BedDouble size={11} />{beds} beds</span>}
            {libraryCount > 0 && <span className="inline-flex items-center gap-1"><BookOpen size={11} />{libraryCount}</span>}
            {doneCount > 0 && <span className="text-good">{doneCount} seen</span>}
          </div>
          {open && <Progress value={doneCount / beds} color={unit.hue} className="mb-3" />}
          <button onClick={go} className="inline-flex items-center gap-1 text-[12.5px] text-accent-deep hover:underline">
            Enter the unit <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Department({ deptId, cases, library, progress, navigate }) {
  const dept = DEPT_BY_ID[deptId];
  const [q, setQ] = useState('');

  const { bedBy, libBy, doneBy } = useMemo(() => {
    const bedBy = {}, libBy = {}, doneBy = {};
    const done = progress?.completedStages || {};
    for (const c of cases) {
      bedBy[c.department] = (bedBy[c.department] || 0) + 1;
      if (done[`rich:${c.id}`] || done[c.id]) doneBy[c.department] = (doneBy[c.department] || 0) + 1;
    }
    for (const l of library) libBy[l.department] = (libBy[l.department] || 0) + 1;
    return { bedBy, libBy, doneBy };
  }, [cases, library, progress]);

  if (!dept) {
    return <Page><EmptyState title="Department not found" body="That department does not exist in this hospital." /></Page>;
  }

  const needle = q.trim().toLowerCase();
  const units = needle
    ? dept.units.filter(u =>
        u.label.toLowerCase().includes(needle) ||
        u.blurb.toLowerCase().includes(needle) ||
        u.topics.some(t => t.toLowerCase().includes(needle)))
    : dept.units;

  const beds = dept.units.reduce((n, u) => n + (u.legacy ? bedBy[u.legacy] || 0 : 0), 0);
  const topics = dept.units.reduce((n, u) => n + u.topics.length, 0);

  return (
    <>
      <header className="hero" style={{ minHeight: 'clamp(220px, 30vw, 340px)' }}>
        <img src={roomFor(dept.units[0])} alt="" className="hero__photo" aria-hidden="true" />
        <div className="hero__scrim" />
        <span className="hero__band" style={{ background: dept.units[0]?.hue }} />
        <div className="hero__inner relative max-w-shell mx-auto px-5 sm:px-7 py-12 flex flex-col justify-end"
          style={{ minHeight: 'clamp(220px, 30vw, 340px)' }}>
          <Eyebrow className="!text-white/70">{dept.kicker}</Eyebrow>
          <h1 className="display text-[36px] sm:text-[50px] leading-[1.04] text-white mt-2"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,.4)' }}>
            {dept.label}
          </h1>
          <p className="text-[16px] text-white/85 leading-relaxed max-w-read mt-3">{dept.blurb}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[13px] text-white/75 nums">
            <span><strong className="text-white font-semibold">{dept.units.length}</strong> units</span>
            <span className="text-white/30">·</span>
            <span><strong className="text-white font-semibold">{topics}</strong> topics</span>
            <span className="text-white/30">·</span>
            <span><strong className="text-white font-semibold">{beds}</strong> beds occupied</span>
          </div>
        </div>
      </header>

      <Page>
        <Breadcrumb trail={[
          { label: 'Hospital', onClick: () => navigate({ name: 'home' }) },
          { label: dept.label },
        ]} />

        <section className="pb-9">
          <div className="flex items-end justify-between gap-5 flex-wrap mb-6">
            <div>
              <h2 className="display text-[24px] text-ink">Units</h2>
              <p className="text-[13px] text-ink-3 mt-1">
                {needle ? `${units.length} of ${dept.units.length} units match “${q}”` : 'Search matches unit names and curriculum topics.'}
              </p>
            </div>
            <SearchField value={q} onChange={setQ} placeholder="Search units and topics…" className="w-full sm:w-80" />
          </div>

          {units.length === 0 ? (
            <EmptyState
              title="Nothing matches that"
              body={`No unit in ${dept.label} covers “${q}”. Try an organ, a syndrome, or a drug class.`}
              icon={BookOpen}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {units.map(u => (
                <UnitCard
                  key={u.id} unit={u} deptId={dept.id}
                  beds={u.legacy ? bedBy[u.legacy] || 0 : 0}
                  libraryCount={u.legacy ? libBy[u.legacy] || 0 : 0}
                  doneCount={u.legacy ? doneBy[u.legacy] || 0 : 0}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </section>

        {!needle && (
          <>
            <Divider />
            <section className="py-10">
              <h2 className="display text-[22px] text-ink mb-1">Curriculum</h2>
              <p className="text-[13px] text-ink-3 mb-7 max-w-read">
                Every topic this department teaches, under the unit that owns it.
              </p>
              <div className="columns-1 md:columns-2 gap-10">
                {dept.units.map(u => (
                  <div key={u.id} className="mb-7 break-inside-avoid">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: u.hue }} />
                      <button
                        onClick={() => navigate({ name: 'unit', deptId: dept.id, unitId: u.id })}
                        className="label text-ink hover:text-accent-deep text-left"
                      >
                        {u.label}
                      </button>
                    </div>
                    <ul className="space-y-1 pl-4">
                      {u.topics.map(t => (
                        <li key={t} className="text-[13px] text-ink-2 leading-snug list-disc marker:text-line">{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </Page>
    </>
  );
}
