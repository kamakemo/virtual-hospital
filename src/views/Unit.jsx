import React, { useMemo, useState } from 'react';
import { BookOpen, BedDouble, ListOrdered, ArrowUpRight } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import WardRoom from '../ui/Ward.jsx';
import { Breadcrumb, EmptyState, Progress, cx } from '../ui/kit.jsx';
import { UNIT_BY_ID, DEPT_BY_ID, roomFor } from '../data/curriculum.js';

function Tab({ active, onClick, icon: Icon, children, count }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'relative inline-flex items-center gap-2 px-1 py-3 text-[13.5px] font-medium transition-colors',
        active ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
      )}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
      {count != null && <span className="text-[11.5px] text-ink-3 nums">{count}</span>}
      {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-accent" />}
    </button>
  );
}

function LibraryRow({ item, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group flex items-start gap-4 w-full text-left py-4 px-1 border-b border-line hover:bg-sunk/50 transition-colors"
    >
      <BookOpen size={14} className="text-ink-3 shrink-0 mt-1" aria-hidden="true" />
      <span className="flex-1 min-w-0">
        {item.category && <span className="block label text-ink-3 mb-1" style={{ fontSize: 9 }}>{item.category}</span>}
        <span className="block text-[15.5px] font-medium leading-snug text-ink group-hover:text-accent-deep">{item.title}</span>
        {item.description && <span className="block text-[13px] text-ink-2 mt-1 leading-relaxed">{item.description}</span>}
      </span>
      <ArrowUpRight size={15} className="text-line group-hover:text-accent shrink-0 mt-1" aria-hidden="true" />
    </button>
  );
}

export default function Unit({ deptId, unitId, cases, library, progress, navigate }) {
  const unit = UNIT_BY_ID[unitId];
  const dept = DEPT_BY_ID[deptId];
  const [tab, setTab] = useState('ward');

  const unitCases = useMemo(
    () => (unit?.legacy ? cases.filter(c => c.department === unit.legacy) : []),
    [cases, unit]
  );
  const unitLibrary = useMemo(
    () => (unit?.legacy ? library.filter(l => l.department === unit.legacy) : []),
    [library, unit]
  );

  if (!unit || !dept) {
    return <Page><EmptyState title="Unit not found" body="That unit is not part of this hospital." /></Page>;
  }

  const done = progress?.completedStages || {};
  const isDone = c => !!(done[`rich:${c.id}`] || done[c.id]);
  const doneCount = unitCases.filter(isDone).length;

  const openCase = c => navigate({ name: 'case', caseId: c.id, deptId, unitId });

  return (
    <>
      {/* ---------- Room banner: the door you just walked through ---------- */}
      <header className="hero" style={{ height: 'clamp(200px, 26vw, 290px)' }}>
        <img src={roomFor(unit)} alt="" className="hero__photo" aria-hidden="true" />
        <div className="hero__scrim" />
        <span className="hero__band" style={{ background: unit.hue }} />
        <div className="hero__inner relative h-full max-w-shell mx-auto px-5 sm:px-7 flex flex-col justify-end pb-7">
          <span className="label text-white/70 mb-2">{dept.label} · Unit</span>
          <h1 className="display text-[30px] sm:text-[44px] leading-[1.05] text-white max-w-[22ch]">
            {unit.label}
          </h1>
          <p className="text-[14.5px] text-white/80 leading-relaxed max-w-read mt-2">{unit.blurb}</p>
        </div>
      </header>

      <Page>
        <Breadcrumb trail={[
          { label: 'Hospital', onClick: () => navigate({ name: 'home' }) },
          { label: dept.label, onClick: () => navigate({ name: 'department', deptId }) },
          { label: unit.short || unit.label },
        ]} />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-3 nums mb-1">
          <span><strong className="text-ink font-semibold">{unitCases.length}</strong> beds occupied</span>
          <span className="text-line">·</span>
          <span><strong className="text-ink font-semibold">{unit.topics.length}</strong> topics</span>
          <span className="text-line">·</span>
          <span><strong className="text-ink font-semibold">{unitLibrary.length}</strong> in the library</span>
          {unitCases.length > 0 && (
            <>
              <span className="text-line">·</span>
              <span className={doneCount ? 'text-good' : ''}>{doneCount} seen</span>
            </>
          )}
        </div>
        {unitCases.length > 0 && (
          <Progress value={doneCount / unitCases.length} color={unit.hue} className="max-w-md mb-6" />
        )}

        <div className="border-b border-line flex items-center gap-7 flex-wrap">
          <Tab active={tab === 'ward'} onClick={() => setTab('ward')} icon={BedDouble}>The unit</Tab>
          <Tab active={tab === 'topics'} onClick={() => setTab('topics')} icon={ListOrdered} count={unit.topics.length}>Topics</Tab>
          <Tab active={tab === 'library'} onClick={() => setTab('library')} icon={BookOpen} count={unitLibrary.length}>Library</Tab>
        </div>

        {tab === 'ward' && (
          <section className="py-7">
            <WardRoom unit={unit} cases={unitCases} progress={progress} onOpenCase={openCase} />
            <p className="text-[12.5px] text-ink-3 mt-3">
              Each bed carries the label of the case it is teaching. Open a bed to work the patient.
            </p>
          </section>
        )}

        {tab === 'topics' && (
          <section className="py-7">
            <div className="max-w-read mb-7">
              <h2 className="display text-[23px] text-ink mb-2">What this unit covers</h2>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                {unit.topics.length} topics make up the curriculum for {unit.label}.
              </p>
            </div>
            <ol className="grid sm:grid-cols-2 gap-x-10 border-t border-line">
              {unit.topics.map((t, i) => (
                <li key={t} className="flex items-baseline gap-4 py-3 border-b border-line-soft">
                  <span className="label text-ink-3 nums w-6 shrink-0" style={{ fontSize: 10 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[14.5px] text-ink-2 leading-snug">{t}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {tab === 'library' && (
          <section className="py-7">
            {unitLibrary.length === 0 ? (
              <EmptyState
                title="The shelf is empty"
                body={`No reading has been published for ${unit.label} yet.`}
                icon={BookOpen}
              />
            ) : (
              <div className="border-t border-line">
                {unitLibrary.map(l => (
                  <LibraryRow key={l.id} item={l}
                    onOpen={() => navigate({ name: 'libraryItem', itemId: l.id, deptId, unitId })} />
                ))}
              </div>
            )}
          </section>
        )}
      </Page>
    </>
  );
}
