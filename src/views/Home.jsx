import React, { useMemo } from 'react';
import { ArrowUpRight, Mic, BedDouble, ListOrdered, BookOpen } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import { Eyebrow, Divider, SectionHead, Progress, cx } from '../ui/kit.jsx';
import { DEPARTMENTS, HOSPITAL, ROOM, roomFor } from '../data/curriculum.js';

function HeroStat({ label, value }) {
  return (
    <div className="pr-7 mr-7 border-r border-white/20 last:border-0 last:mr-0 last:pr-0">
      <div className="display text-[28px] sm:text-[34px] leading-none text-white nums">{value}</div>
      <div className="label text-white/60 mt-2">{label}</div>
    </div>
  );
}

function UnitLine({ unit, beds, onClick }) {
  const stocked = beds > 0;
  return (
    <button onClick={onClick} className="group flex items-baseline gap-3 w-full text-left py-[7px] border-b border-line-soft last:border-0">
      <span className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: stocked ? unit.hue : 'var(--line)' }} />
      <span className={cx('text-[13.5px] flex-1 min-w-0 truncate', stocked ? 'text-ink-2 group-hover:text-accent-deep' : 'text-ink-3')}
        title={unit.label}>
        {unit.short || unit.label}
      </span>
      <span className="text-[11.5px] nums shrink-0 text-ink-3">{unit.topics.length} topics</span>
    </button>
  );
}

function DepartmentBlock({ dept, bedsFor, navigate }) {
  const beds = dept.units.reduce((n, u) => n + bedsFor(u), 0);
  const topics = dept.units.reduce((n, u) => n + u.topics.length, 0);
  const open = dept.units.filter(u => bedsFor(u) > 0).length;
  const half = Math.ceil(dept.units.length / 2);
  const photo = roomFor(dept.units[0]);

  return (
    <article className="rounded-2xl overflow-hidden bg-panel border border-line"
      style={{ boxShadow: '0 1px 2px rgba(10,30,40,.05), 0 20px 44px -28px rgba(10,30,40,.42)' }}>
      {/* Photographic header — the corridor into the department */}
      <div className="hero" style={{ height: 168 }}>
        <img src={photo} alt="" className="hero__photo" aria-hidden="true" style={{ animation: 'none', transform: 'scale(1.04)' }} />
        <div className="hero__scrim" />
        <span className="hero__band" style={{ background: dept.units[0]?.hue }} />
        <div className="hero__inner relative h-full px-6 flex flex-col justify-end pb-5">
          <span className="label text-white/65">{dept.kicker}</span>
          <h3 className="display text-[27px] leading-tight text-white mt-1">{dept.label}</h3>
        </div>
        <button
          onClick={() => navigate({ name: 'department', deptId: dept.id })}
          className="hero__inner absolute top-4 right-5 inline-flex items-center gap-1 text-[12.5px] font-medium text-white/90 hover:text-white bg-white/10 border border-white/25 rounded-full px-3 py-1.5 backdrop-blur-sm"
        >
          Enter <ArrowUpRight size={12} />
        </button>
      </div>

      <div className="p-6">
        <p className="text-[14.5px] text-ink-2 leading-relaxed max-w-[52ch] mb-5">{dept.blurb}</p>

        <div className="flex items-center gap-4 text-[12.5px] text-ink-3 mb-2.5 nums flex-wrap">
          <span className="inline-flex items-center gap-1.5"><ListOrdered size={12} /><strong className="text-ink font-semibold">{dept.units.length}</strong> units</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen size={12} /><strong className="text-ink font-semibold">{topics}</strong> topics</span>
          <span className="inline-flex items-center gap-1.5"><BedDouble size={12} /><strong className="text-ink font-semibold">{beds}</strong> beds occupied</span>
        </div>
        <Progress value={open / dept.units.length} color={dept.units[0]?.hue} className="mb-5" />

        <div className="grid sm:grid-cols-2 gap-x-7">
          <div>
            {dept.units.slice(0, half).map(u => (
              <UnitLine key={u.id} unit={u} beds={bedsFor(u)}
                onClick={() => navigate({ name: 'unit', deptId: dept.id, unitId: u.id })} />
            ))}
          </div>
          <div>
            {dept.units.slice(half).map(u => (
              <UnitLine key={u.id} unit={u} beds={bedsFor(u)}
                onClick={() => navigate({ name: 'unit', deptId: dept.id, unitId: u.id })} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Home({ cases, library, conferences, progress, navigate }) {
  const bedsFor = useMemo(() => {
    const byDept = cases.reduce((acc, c) => { acc[c.department] = (acc[c.department] || 0) + 1; return acc; }, {});
    return unit => (unit.legacy ? byDept[unit.legacy] || 0 : 0);
  }, [cases]);

  const unitCount = DEPARTMENTS.reduce((n, d) => n + d.units.length, 0);
  const topicCount = DEPARTMENTS.reduce((n, d) => n + d.units.reduce((m, u) => m + u.topics.length, 0), 0);

  return (
    <>
      {/* ---------- The hospital, from the floor ---------- */}
      <header className="hero" style={{ minHeight: 'clamp(380px, 52vw, 560px)' }}>
        <img src={ROOM.ed} alt="" className="hero__photo" aria-hidden="true" />
        <div className="hero__scrim" />
        <div className="hero__band" />
        <div className="hero__inner relative max-w-shell mx-auto px-5 sm:px-7 py-16 sm:py-24 flex flex-col justify-end"
          style={{ minHeight: 'clamp(380px, 52vw, 560px)' }}>
          <Eyebrow className="!text-white/70">{HOSPITAL.short} · Session 2026</Eyebrow>
          <h1 className="display text-[40px] sm:text-[60px] leading-[1.02] text-white mt-3 max-w-[18ch]"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,.45)' }}>
            Walk the floor. Take the bed. Work the patient.
          </h1>
          <p className="text-[16.5px] sm:text-[18px] text-white/85 leading-relaxed max-w-[56ch] mt-5">
            Two departments, {unitCount} units, every one of them a room you can walk into. Each bed
            carries a case; each unit carries its curriculum and its library.
          </p>
          <div className="flex flex-wrap mt-10">
            <HeroStat label="Units" value={unitCount} />
            <HeroStat label="Occupied beds" value={cases.length} />
            <HeroStat label="Topics" value={topicCount} />
            <HeroStat label="Conferences" value={conferences.length} />
          </div>
        </div>
      </header>

      <Page>
        {/* ---------- The two departments ---------- */}
        <section className="pb-11">
          <SectionHead
            eyebrow="The hospital"
            title="Where do you want to work today?"
            meta="Open a unit to stand in the room. Beds with a label have a patient waiting."
          />
          <div className="grid lg:grid-cols-2 gap-7">
            {DEPARTMENTS.map(d => (
              <DepartmentBlock key={d.id} dept={d} bedsFor={bedsFor} navigate={navigate} />
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
            <div className="grid sm:grid-cols-2 gap-4">
              {conferences.slice(0, 6).map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate({ name: 'conference', conferenceId: c.id })}
                  className="group flex items-start gap-4 text-left p-5 rounded-xl bg-panel border border-line hover:border-accent/40 transition-colors"
                  style={{ boxShadow: '0 1px 2px rgba(10,30,40,.04), 0 14px 30px -24px rgba(10,30,40,.35)' }}
                >
                  <span className="w-9 h-9 rounded-lg bg-accent-soft text-accent-deep flex items-center justify-center shrink-0">
                    <Mic size={15} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-medium text-ink group-hover:text-accent-deep leading-snug">{c.title}</span>
                    {c.subtitle && <span className="block text-[12.5px] text-ink-3 mt-1 line-clamp-2 leading-snug">{c.subtitle}</span>}
                  </span>
                  <ArrowUpRight size={14} className="text-line group-hover:text-accent shrink-0 mt-1" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </section>
      </Page>
    </>
  );
}
