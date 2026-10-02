import React, { useMemo, useState } from 'react';
import { BookOpen, BedDouble, ListFilter, ArrowUpRight } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import WardFloor from '../ui/Ward.jsx';
import {
  Panel, Eyebrow, Divider, Breadcrumb, SearchField, EmptyState, Chip,
  SeverityTag, Progress, cx,
} from '../ui/kit.jsx';
import { UNIT_BY_ID, DEPT_BY_ID } from '../data/curriculum.js';

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

function CaseRow({ caseData: c, hue, done, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group flex items-start gap-4 w-full text-left py-4 px-1 border-b border-line hover:bg-sunk/50 transition-colors"
    >
      <span className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: hue }} aria-hidden="true" />
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 flex-wrap mb-1">
          <SeverityTag severity={c.severity} />
          {done && <span className="label text-good" style={{ fontSize: 9 }}>Completed</span>}
          {Number.isFinite(c.bedNumber) && c.bedNumber > 0 && (
            <span className="label text-ink-3 nums" style={{ fontSize: 9 }}>Bed {c.bedNumber}</span>
          )}
        </span>
        <span className="block text-[15.5px] font-medium leading-snug text-ink group-hover:text-accent-deep">
          {c.title}
        </span>
        {c.chiefComplaint && (
          <span className="block text-[13px] text-ink-2 mt-1 leading-relaxed">{c.chiefComplaint}</span>
        )}
        {c.tags?.length > 0 && (
          <span className="flex flex-wrap gap-1.5 mt-2">
            {c.tags.slice(0, 5).map(t => <Chip key={t} tone="quiet">{t}</Chip>)}
          </span>
        )}
      </span>
      <ArrowUpRight size={15} className="text-line group-hover:text-accent shrink-0 mt-1" aria-hidden="true" />
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
        <span className="block text-[15.5px] font-medium leading-snug text-ink group-hover:text-accent-deep">
          {item.title}
        </span>
        {item.description && (
          <span className="block text-[13px] text-ink-2 mt-1 leading-relaxed">{item.description}</span>
        )}
      </span>
      <ArrowUpRight size={15} className="text-line group-hover:text-accent shrink-0 mt-1" aria-hidden="true" />
    </button>
  );
}

export default function Unit({ deptId, unitId, cases, library, progress, navigate }) {
  const unit = UNIT_BY_ID[unitId];
  const dept = DEPT_BY_ID[deptId];
  const [tab, setTab] = useState(unit?.ward ? 'ward' : 'cases');
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('all');

  const unitCases = useMemo(
    () => (unit?.legacy ? cases.filter(c => c.department === unit.legacy) : []),
    [cases, unit]
  );
  const unitLibrary = useMemo(
    () => (unit?.legacy ? library.filter(l => l.department === unit.legacy) : []),
    [library, unit]
  );

  if (!unit || !dept) {
    return (
      <Page>
        <EmptyState title="Unit not found" body="That unit is not part of this hospital." />
      </Page>
    );
  }

  const done = progress?.completedStages || {};
  const isDone = c => !!(done[`rich:${c.id}`] || done[c.id]);
  const doneCount = unitCases.filter(isDone).length;

  const needle = q.trim().toLowerCase();
  const filtered = unitCases.filter(c => {
    if (sev !== 'all' && c.severity !== sev) return false;
    if (!needle) return true;
    return (
      c.title?.toLowerCase().includes(needle) ||
      c.chiefComplaint?.toLowerCase().includes(needle) ||
      c.tags?.some(t => t.toLowerCase().includes(needle))
    );
  });

  const openCase = c => navigate({ name: 'case', caseId: c.id, deptId, unitId });

  return (
    <Page>
      <Breadcrumb trail={[
        { label: 'Hospital', onClick: () => navigate({ name: 'home' }) },
        { label: dept.label, onClick: () => navigate({ name: 'department', deptId }) },
        { label: unit.short || unit.label },
      ]} />

      {/* ---------- Unit header ---------- */}
      <section className="pb-7">
        <div className="flex items-start gap-4">
          <span className="w-[4px] self-stretch rounded-full shrink-0 mt-1" style={{ background: unit.hue }} aria-hidden="true" />
          <div className="min-w-0">
            <Eyebrow>{dept.label} · Unit</Eyebrow>
            <h1 className="display text-[32px] sm:text-[42px] leading-[1.07] text-ink mt-2">{unit.label}</h1>
            <p className="text-[16px] text-ink-2 leading-relaxed max-w-read mt-3">{unit.blurb}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-[13px] text-ink-3 nums">
          <span><strong className="text-ink font-semibold">{unitCases.length}</strong> cases</span>
          <span className="text-line">·</span>
          <span><strong className="text-ink font-semibold">{unitLibrary.length}</strong> library topics</span>
          <span className="text-line">·</span>
          <span><strong className="text-ink font-semibold">{unit.topics.length}</strong> curriculum topics</span>
          {unitCases.length > 0 && (
            <>
              <span className="text-line">·</span>
              <span className={doneCount ? 'text-good' : ''}>{doneCount} completed</span>
            </>
          )}
        </div>
        {unitCases.length > 0 && (
          <Progress value={doneCount / unitCases.length} color={unit.hue} className="mt-3 max-w-md" />
        )}
      </section>

      {/* ---------- Tabs ---------- */}
      <div className="border-b border-line flex items-center gap-7 flex-wrap">
        {unit.ward && (
          <Tab active={tab === 'ward'} onClick={() => setTab('ward')} icon={BedDouble}>Ward</Tab>
        )}
        <Tab active={tab === 'cases'} onClick={() => setTab('cases')} icon={ListFilter} count={unitCases.length}>
          Cases
        </Tab>
        <Tab active={tab === 'library'} onClick={() => setTab('library')} icon={BookOpen} count={unitLibrary.length}>
          Library
        </Tab>
        <Tab active={tab === 'curriculum'} onClick={() => setTab('curriculum')}>Curriculum</Tab>
      </div>

      {/* ---------- Ward ---------- */}
      {tab === 'ward' && (
        <section className="py-7">
          {unitCases.length === 0 ? (
            <EmptyState
              title="No patients admitted yet"
              body={`${unit.label} has a ward floor ready, but no cases have been written for it. The curriculum tab lists what belongs here.`}
              icon={BedDouble}
            />
          ) : (
            <WardFloor unit={unit} cases={unitCases} progress={progress} onOpenCase={openCase} />
          )}
        </section>
      )}

      {/* ---------- Case index ---------- */}
      {tab === 'cases' && (
        <section className="py-7">
          {unitCases.length === 0 ? (
            <EmptyState
              title="No cases in this unit yet"
              body="The curriculum for this unit is defined — see the Curriculum tab for every topic it will cover."
              icon={ListFilter}
            />
          ) : (
            <>
              <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
                <div className="flex items-center gap-1.5">
                  {['all', 'critical', 'urgent', 'stable'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSev(s)}
                      className={cx(
                        'px-2.5 py-1 rounded border text-[12px] font-medium capitalize transition-colors',
                        sev === s ? 'bg-accent text-white border-accent' : 'bg-panel text-ink-2 border-line hover:border-accent/40'
                      )}
                    >
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
                <SearchField value={q} onChange={setQ} placeholder="Search cases, complaints, tags…" className="w-full sm:w-80" />
              </div>

              {filtered.length === 0 ? (
                <EmptyState title="No case matches" body="Try clearing the severity filter or searching a broader term." />
              ) : (
                <div className="border-t border-line">
                  {filtered.map(c => (
                    <CaseRow key={c.id} caseData={c} hue={unit.hue} done={isDone(c)} onOpen={() => openCase(c)} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ---------- Library ---------- */}
      {tab === 'library' && (
        <section className="py-7">
          {unitLibrary.length === 0 ? (
            <EmptyState
              title="The shelf is empty"
              body={`No reading has been published for ${unit.label} yet. Library topics are reference material — reviews, algorithms and drug tables — to read around a case.`}
              icon={BookOpen}
            />
          ) : (
            <div className="border-t border-line">
              {unitLibrary.map(l => (
                <LibraryRow
                  key={l.id}
                  item={l}
                  onOpen={() => navigate({ name: 'libraryItem', itemId: l.id, deptId, unitId })}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---------- Curriculum ---------- */}
      {tab === 'curriculum' && (
        <section className="py-7">
          <div className="max-w-read">
            <h2 className="display text-[22px] text-ink mb-2">What this unit is responsible for</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed mb-7">
              {unit.topics.length} topics. Each one should end up with at least one worked case or
              a library entry; the counts above tell you how far along that is.
            </p>
          </div>
          <ol className="border-t border-line max-w-read">
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
    </Page>
  );
}
