import React, { useMemo, useState } from 'react';
import { ArrowUpRight, BookOpen, BedDouble } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import {
  Panel, Eyebrow, Divider, Breadcrumb, Progress, SearchField, EmptyState, Chip, cx,
} from '../ui/kit.jsx';
import { DEPT_BY_ID } from '../data/curriculum.js';

function UnitCard({ unit, caseCount, libraryCount, doneCount, navigate, deptId }) {
  const stocked = caseCount > 0;
  return (
    <Panel
      edge={stocked ? unit.hue : 'var(--line)'}
      className={cx('p-5 flex flex-col', !stocked && 'bg-paper')}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="display text-[19px] leading-snug text-ink">
          <button
            onClick={() => navigate({ name: 'unit', deptId, unitId: unit.id })}
            className="text-left hover:text-accent-deep"
          >
            {unit.label}
          </button>
        </h3>
        {unit.ward && (
          <span title="This unit has a ward floor">
            <BedDouble size={14} className="text-ink-3 shrink-0 mt-1" aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="text-[13.5px] text-ink-2 leading-relaxed mb-4">{unit.blurb}</p>

      <div className="mt-auto">
        <div className="flex items-center gap-3 text-[12px] text-ink-3 nums mb-2.5">
          {stocked ? (
            <>
              <span><strong className="text-ink font-semibold">{caseCount}</strong> cases</span>
              {libraryCount > 0 && <><span className="text-line">·</span><span>{libraryCount} in library</span></>}
              {doneCount > 0 && <><span className="text-line">·</span><span className="text-good">{doneCount} done</span></>}
            </>
          ) : (
            <span className="label" style={{ fontSize: 9.5 }}>Curriculum defined · content coming</span>
          )}
        </div>
        {stocked && <Progress value={caseCount ? doneCount / caseCount : 0} color={unit.hue} className="mb-3" />}
        <div className="flex items-center gap-2 text-[11px] text-ink-3">
          <span>{unit.topics.length} curriculum topics</span>
          <button
            onClick={() => navigate({ name: 'unit', deptId, unitId: unit.id })}
            className="ml-auto inline-flex items-center gap-1 text-[12.5px] text-accent-deep hover:underline"
          >
            Open <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </Panel>
  );
}

export default function Department({ deptId, cases, library, progress, navigate }) {
  const dept = DEPT_BY_ID[deptId];
  const [q, setQ] = useState('');

  const { caseBy, libBy, doneBy } = useMemo(() => {
    const caseBy = {}, libBy = {}, doneBy = {};
    const done = progress?.completedStages || {};
    for (const c of cases) {
      caseBy[c.department] = (caseBy[c.department] || 0) + 1;
      if (done[`rich:${c.id}`] || done[c.id]) doneBy[c.department] = (doneBy[c.department] || 0) + 1;
    }
    for (const l of library) libBy[l.department] = (libBy[l.department] || 0) + 1;
    return { caseBy, libBy, doneBy };
  }, [cases, library, progress]);

  if (!dept) {
    return (
      <Page>
        <EmptyState title="Department not found" body="That department does not exist in this hospital." />
      </Page>
    );
  }

  const needle = q.trim().toLowerCase();
  const units = needle
    ? dept.units.filter(u =>
        u.label.toLowerCase().includes(needle) ||
        u.blurb.toLowerCase().includes(needle) ||
        u.topics.some(t => t.toLowerCase().includes(needle))
      )
    : dept.units;

  const totalCases = dept.units.reduce((n, u) => n + (u.legacy ? caseBy[u.legacy] || 0 : 0), 0);
  const totalTopics = dept.units.reduce((n, u) => n + u.topics.length, 0);

  return (
    <Page>
      <Breadcrumb trail={[
        { label: 'Hospital', onClick: () => navigate({ name: 'home' }) },
        { label: dept.label },
      ]} />

      <section className="pb-8">
        <Eyebrow>{dept.kicker}</Eyebrow>
        <h1 className="display text-[36px] sm:text-[46px] leading-[1.06] text-ink mt-2">{dept.label}</h1>
        <p className="text-[16.5px] text-ink-2 leading-relaxed max-w-read mt-4">{dept.blurb}</p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-[13px] text-ink-3 nums">
          <span><strong className="text-ink font-semibold">{dept.units.length}</strong> units</span>
          <span className="text-line">·</span>
          <span><strong className="text-ink font-semibold">{totalCases}</strong> cases</span>
          <span className="text-line">·</span>
          <span><strong className="text-ink font-semibold">{totalTopics}</strong> curriculum topics</span>
        </div>
      </section>

      <Divider />

      <section className="py-8">
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
            body={`No unit in ${dept.label} covers “${q}”. Try a broader term — an organ, a syndrome, or a drug class.`}
            icon={BookOpen}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {units.map(u => (
              <UnitCard
                key={u.id}
                unit={u}
                deptId={dept.id}
                caseCount={u.legacy ? caseBy[u.legacy] || 0 : 0}
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
          <section className="py-9">
            <h2 className="display text-[22px] text-ink mb-1">Curriculum coverage</h2>
            <p className="text-[13px] text-ink-3 mb-6 max-w-read">
              Every topic this department is responsible for, listed under the unit that teaches it.
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
  );
}
