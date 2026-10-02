import React, { useMemo } from 'react';
import { ArrowUpRight, BookOpen, Mic } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import { Panel, Eyebrow, Divider, SectionHead, Progress, cx } from '../ui/kit.jsx';
import { DEPARTMENTS, HOSPITAL } from '../data/curriculum.js';

function Stat({ label, value, note }) {
  return (
    <div className="pr-8 mr-8 border-r border-line last:border-0 last:mr-0 last:pr-0">
      <div className="display text-[30px] leading-none text-ink nums">{value}</div>
      <div className="label text-ink-3 mt-2">{label}</div>
      {note && <div className="text-[12px] text-ink-3 mt-0.5">{note}</div>}
    </div>
  );
}

function UnitLine({ unit, count, onClick }) {
  const stocked = count > 0;
  return (
    <button
      onClick={onClick}
      className="group flex items-baseline gap-3 w-full text-left py-[7px] border-b border-line-soft last:border-0"
    >
      <span className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: stocked ? unit.hue : 'var(--line)' }} />
      <span className={cx('text-[13.5px] flex-1 min-w-0 truncate', stocked ? 'text-ink-2 group-hover:text-accent-deep' : 'text-ink-3')}
        title={unit.label}>
        {unit.short || unit.label}
      </span>
      <span className="text-[12px] nums shrink-0 text-ink-3">
        {stocked ? count : <span className="label" style={{ fontSize: 9 }}>Soon</span>}
      </span>
    </button>
  );
}

function DepartmentBlock({ dept, countFor, navigate }) {
  const total = dept.units.reduce((n, u) => n + countFor(u), 0);
  const stocked = dept.units.filter(u => countFor(u) > 0).length;
  const half = Math.ceil(dept.units.length / 2);

  return (
    <Panel edge={dept.units[0]?.hue} className="p-6 sm:p-7">
      <div className="flex items-start justify-between gap-5 flex-wrap mb-4">
        <div className="min-w-0">
          <Eyebrow>{dept.kicker}</Eyebrow>
          <h3 className="display text-[26px] leading-tight text-ink mt-1">{dept.label}</h3>
        </div>
        <button
          onClick={() => navigate({ name: 'department', deptId: dept.id })}
          className="inline-flex items-center gap-1 text-[13px] text-accent-deep hover:underline shrink-0 mt-1"
        >
          Enter department <ArrowUpRight size={13} />
        </button>
      </div>

      <p className="text-[14.5px] text-ink-2 leading-relaxed max-w-[52ch] mb-5">{dept.blurb}</p>

      <div className="flex items-center gap-5 text-[12.5px] text-ink-3 mb-5 nums">
        <span><strong className="text-ink font-semibold">{dept.units.length}</strong> units</span>
        <span className="text-line">·</span>
        <span><strong className="text-ink font-semibold">{total}</strong> cases</span>
        <span className="text-line">·</span>
        <span>{stocked} of {dept.units.length} stocked</span>
      </div>
      <Progress value={stocked / dept.units.length} color={dept.units[0]?.hue} className="mb-5" />

      <div className="grid sm:grid-cols-2 gap-x-7">
        <div>
          {dept.units.slice(0, half).map(u => (
            <UnitLine key={u.id} unit={u} count={countFor(u)}
              onClick={() => navigate({ name: 'unit', deptId: dept.id, unitId: u.id })} />
          ))}
        </div>
        <div>
          {dept.units.slice(half).map(u => (
            <UnitLine key={u.id} unit={u} count={countFor(u)}
              onClick={() => navigate({ name: 'unit', deptId: dept.id, unitId: u.id })} />
          ))}
        </div>
      </div>
    </Panel>
  );
}

export default function Home({ cases, library, conferences, progress, navigate }) {
  const countFor = useMemo(() => {
    const byDept = cases.reduce((acc, c) => {
      acc[c.department] = (acc[c.department] || 0) + 1;
      return acc;
    }, {});
    return unit => (unit.legacy ? byDept[unit.legacy] || 0 : 0);
  }, [cases]);

  const unitCount = DEPARTMENTS.reduce((n, d) => n + d.units.length, 0);
  const doneCount = Object.keys(progress?.completedStages || {}).filter(k => k.startsWith('rich:')).length;

  return (
    <Page>
      {/* ---------- Opening ---------- */}
      <section className="pb-10">
        <Eyebrow>{HOSPITAL.short} · Session 2026</Eyebrow>
        <h1 className="display text-[38px] sm:text-[54px] leading-[1.04] text-ink mt-3 max-w-[22ch]">
          Two departments. Twenty-eight units. Cases that behave like patients.
        </h1>
        <p className="text-[17px] text-ink-2 leading-relaxed max-w-read mt-5">
          {HOSPITAL.name} is a curriculum shaped like a hospital. Walk into Cardiology or
          Internal Medicine, pick a unit, and work a patient from handover to discharge —
          then read around it in that unit&rsquo;s library, or sit in on a conference.
        </p>

        <div className="flex flex-wrap mt-9">
          <Stat label="Cases" value={cases.length} />
          <Stat label="Units" value={unitCount} note="across 2 departments" />
          <Stat label="Library topics" value={library.length} />
          <Stat label="Conferences" value={conferences.length} />
          {doneCount > 0 && <Stat label="You've completed" value={doneCount} note="keep going" />}
        </div>
      </section>

      <Divider />

      {/* ---------- The two departments ---------- */}
      <section className="py-11">
        <SectionHead
          eyebrow="The hospital"
          title="Where do you want to work today?"
          meta="Each unit holds its own cases and its own reading shelf. Units marked “Soon” are defined in the curriculum but not yet stocked."
        />
        <div className="grid lg:grid-cols-2 gap-6">
          {DEPARTMENTS.map(d => (
            <DepartmentBlock key={d.id} dept={d} countFor={countFor} navigate={navigate} />
          ))}
        </div>
      </section>

      <Divider />

      {/* ---------- Conferences ---------- */}
      <section className="py-11">
        <SectionHead
          eyebrow="Beyond the ward"
          title="Conferences"
          meta="Multi-day meetings with speakers, moderated discussion and a written lecture for every session."
          action={
            <button onClick={() => navigate({ name: 'conferences' })}
              className="inline-flex items-center gap-1 text-[13px] text-accent-deep hover:underline">
              All conferences <ArrowUpRight size={13} />
            </button>
          }
        />
        {conferences.length === 0 ? (
          <p className="text-sm text-ink-3">No conferences published yet.</p>
        ) : (
          <div className="border-t border-line">
            {conferences.slice(0, 6).map(c => (
              <button
                key={c.id}
                onClick={() => navigate({ name: 'conference', conferenceId: c.id })}
                className="group flex items-center gap-5 w-full text-left py-4 border-b border-line hover:bg-sunk/60 transition-colors px-1"
              >
                <Mic size={14} className="text-ink-3 shrink-0" aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] text-ink group-hover:text-accent-deep font-medium truncate">{c.title}</span>
                  {c.subtitle && <span className="block text-[13px] text-ink-3 truncate mt-0.5">{c.subtitle}</span>}
                </span>
                {c.dateLabel && <span className="hidden sm:block text-[12px] text-ink-3 nums shrink-0">{c.dateLabel}</span>}
                <ArrowUpRight size={14} className="text-line group-hover:text-accent shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </section>

      <Divider />

      {/* ---------- How it works ---------- */}
      <section className="py-11">
        <SectionHead eyebrow="How a unit works" title="Three ways in" />
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { t: 'The cases', b: 'Full teaching case files — handover, examination, investigations, the consultant round, complications, and assessment at the end. Marked complete when you finish one.', i: BookOpen },
            { t: 'The ward', b: 'In the time-critical units — Emergency, Coronary Care, the Cath and EP labs, Critical Care — the cases are laid out as occupied beds. Click a bed, get that patient.', i: Mic },
            { t: 'The library', b: 'Reference material written for the unit: reviews, algorithms, drug tables and summaries to read around a case rather than inside it.', i: BookOpen },
          ].map(x => (
            <div key={x.t}>
              <h3 className="display text-[18px] text-ink mb-2">{x.t}</h3>
              <p className="text-[14px] text-ink-2 leading-relaxed">{x.b}</p>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
