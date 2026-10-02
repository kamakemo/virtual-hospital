import React from 'react';
import { cx } from './kit.jsx';
import { roomFor, SEVERITY } from '../data/curriculum.js';

/* ============================================================
   THE UNIT ROOM
   Every unit is a real room. The photograph behind is the room
   you are standing in; the bays drawn in front are the beds, and
   each bed carries the placard and the label of its case.
   ============================================================ */

const TRACE = {
  critical: { stroke: '#FF5A52', dur: '2.0s' },
  urgent:   { stroke: '#FFB020', dur: '2.8s' },
  stable:   { stroke: '#3DDC84', dur: '3.6s' },
};

function MonitorTrace({ severity }) {
  const t = TRACE[severity] || TRACE.stable;
  const cycle = 'l12,0 l4,-3 l3,5 l2,-14 l3,23 l3,-11 l5,0 c3,-7 7,-7 10,0 l15,0';
  return (
    <svg viewBox="0 0 171 30" preserveAspectRatio="none" className="w-full h-[28px] block" aria-hidden="true">
      <g className="trace-run" style={{ '--trace-dur': t.dur }}>
        <path d={'M0,15' + cycle.repeat(6)} fill="none" stroke={t.stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/* An articulated ward bed, drawn from the side: chrome base on castors,
   padded side rail, raised head section, linen and blanket. */
function BedArt({ occupied }) {
  const frame = occupied ? '#2E4D7E' : '#8E9CAC';
  const panel = occupied ? '#C9DAF2' : '#DCE2E9';
  const linen = occupied ? '#F4F8FD' : '#E8ECF1';
  const rail  = occupied ? '#44639C' : '#9BA7B5';
  return (
    <svg viewBox="0 0 260 152" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="mattressG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor={linen} />
        </linearGradient>
      </defs>
      <ellipse cx="132" cy="142" rx="106" ry="6" fill="#04101A" opacity="0.26" />
      {[46, 96, 166, 216].map(x => (
        <g key={x}>
          <circle cx={x} cy="133" r="7" fill="#5C6B7C" />
          <circle cx={x} cy="133" r="2.6" fill="#C2CBD5" />
        </g>
      ))}
      <path d="M50,132 L96,112 M96,132 L50,112 M166,132 L216,112 M216,132 L166,112"
        stroke="#A8B4C1" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <rect x="44" y="104" width="178" height="9" rx="4" fill="#BDC8D4" />
      <rect x="44" y="104" width="178" height="3.5" rx="2" fill="#E3EAF1" />

      {/* footboard + headboard */}
      <rect x="212" y="66" width="20" height="46" rx="6" fill={frame} />
      <rect x="216" y="72" width="12" height="28" rx="4" fill={panel} />
      <rect x="28" y="40" width="22" height="72" rx="7" fill={frame} />
      <rect x="32" y="50" width="14" height="44" rx="5" fill={panel} />

      {/* platform, mattress, raised head */}
      <rect x="46" y="85" width="172" height="12" rx="4" fill="#92A6C2" />
      <rect x="48" y="68" width="168" height="21" rx="9" fill="url(#mattressG)" stroke="#CEDEF0" strokeWidth="1.5" />
      {occupied && (
        <>
          <path d="M126,70 h84 a8,8 0 0 1 8,8 v5 a4,4 0 0 1 -4,4 h-88 z" fill="#B7CDEC" />
          <path d="M126,70 v17" stroke="#A3BFE3" strokeWidth="1.5" />
          <g transform="rotate(-9 80 62)">
            <rect x="52" y="54" width="54" height="18" rx="9" fill="#FFFFFF" stroke="#DCE6F2" strokeWidth="1.2" />
          </g>
        </>
      )}

      {/* near side rail */}
      <rect x="58" y="72" width="154" height="16" rx="6" fill={rail} />
      <rect x="58" y="74" width="154" height="4" rx="2" fill={occupied ? '#BFD2EE' : '#C7CEd6'} />
      {[74, 97, 120, 143, 166, 189].map(x => (
        <rect key={x} x={x} y="79" width="3.5" height="8" rx="1.8" fill={occupied ? '#23406F' : '#808E9D'} />
      ))}
    </svg>
  );
}

function Bay({ bedNumber, caseData: c, hue, done, onOpen }) {
  const occupied = !!c;
  const sev = c ? SEVERITY[c.severity] : null;

  return (
    <div
      className={cx(
        'bay3d rounded-xl overflow-hidden flex flex-col',
        occupied ? 'is-live bg-white/[0.07] border border-white/15' : 'bg-white/[0.03] border border-dashed border-white/12'
      )}
    >
      {/* Headwall: red bed placard, gas outlets */}
      <div className="flex items-center gap-2 px-2.5 py-2 bg-[#0C2029]/80 border-b border-white/10">
        <span className="placard rounded px-2 py-[3px] label nums" style={{ fontSize: 9.5, letterSpacing: '0.12em' }}>
          Bed {String(bedNumber).padStart(2, '0')}
        </span>
        {sev && (
          <span className="label px-1.5 py-[2px] rounded" style={{ fontSize: 8.5, color: '#07161D', background: sev.color }}>
            {sev.label}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-sm bg-white/90 border border-white/40" title="Oxygen" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#1E2A36] border border-white/25" title="Air" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#E9C23F] border border-black/20" title="Suction" />
        </span>
      </div>

      {/* Wall-mounted monitor */}
      <div className="bg-[#040C12] px-2 pt-1.5 pb-1 border-b border-white/10">
        {occupied ? (
          <>
            <MonitorTrace severity={c.severity} />
            <div className="flex items-center justify-between font-mono text-[9.5px] leading-none pb-0.5 nums">
              <span style={{ color: TRACE[c.severity]?.stroke || '#3DDC84' }}>
                {c.vitals?.hr || '--'}<span className="text-[7px] text-[#5C7489] ml-0.5">bpm</span>
              </span>
              <span className="text-[#4FC3F7]">
                {c.vitals?.spo2 || '--'}<span className="text-[7px] text-[#5C7489] ml-0.5">%</span>
              </span>
              <span className="text-[#9FB3C6]">{c.vitals?.bp || '--/--'}</span>
            </div>
          </>
        ) : (
          <div className="h-[34px] flex items-center justify-center font-mono label text-[#44586B]" style={{ fontSize: 9 }}>
            Monitor off
          </div>
        )}
      </div>

      {/* The bed, standing on the room floor */}
      <div className="px-3 pt-3 pb-1 relative">
        {occupied && (
          <span className="absolute left-2.5 bottom-2 flex flex-col items-center pointer-events-none" aria-hidden="true">
            <span className="w-2.5 h-3.5 rounded-sm bg-[#CFE6F7]/90 border border-white/40" />
            <span className="w-[2px] h-16 bg-white/35" />
          </span>
        )}
        <BedArt occupied={occupied} />
      </div>

      {/* The label of the case — what this bed is teaching */}
      <div className="mt-auto p-2.5">
        {occupied ? (
          <button
            onClick={onOpen}
            className="plate block w-full text-left rounded-lg px-3 py-2.5 group transition-colors hover:bg-white"
            style={{ borderLeft: `3px solid ${hue}` }}
          >
            <span className="block text-[13px] font-semibold leading-snug text-ink group-hover:text-accent-deep">
              {c.title}
            </span>
            {c.chiefComplaint && (
              <span className="block text-[11.5px] text-ink-3 mt-0.5 line-clamp-2 leading-snug">
                {c.chiefComplaint}
              </span>
            )}
            <span className="flex items-center justify-between gap-2 mt-1.5 text-[10.5px] nums">
              <span className="text-ink-3 truncate">
                {c.profile?.age ? `${c.profile.age}${(c.profile.sex || '')[0] || ''}` : '—'}
                {c.profile?.name ? ` · ${c.profile.name}` : ''}
              </span>
              {done
                ? <span className="label text-good" style={{ fontSize: 9 }}>Seen</span>
                : <span className="label text-accent" style={{ fontSize: 9 }}>Open →</span>}
            </span>
          </button>
        ) : (
          <div className="rounded-lg border border-dashed border-white/20 px-3 py-3 text-center">
            <span className="label text-white/45" style={{ fontSize: 9 }}>Bed available</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WardRoom({ unit, cases, progress, onOpenCase }) {
  const done = progress?.completedStages || {};
  const withBed = cases.filter(c => Number.isFinite(c.bedNumber) && c.bedNumber > 0);
  const withoutBed = cases.filter(c => !(Number.isFinite(c.bedNumber) && c.bedNumber > 0));
  const taken = new Set(withBed.map(c => c.bedNumber));

  const total = Math.max(
    cases.length + (cases.length ? 2 : 6),
    6,
    ...(withBed.length ? withBed.map(c => c.bedNumber) : [0])
  );

  const queue = [...withoutBed];
  const slots = [];
  for (let n = 1; n <= total; n++) {
    const pinned = withBed.find(c => c.bedNumber === n);
    slots.push({ bedNumber: n, case: pinned || (taken.has(n) ? null : queue.shift() || null) });
  }

  const occupied = slots.filter(s => s.case).length;

  return (
    <div className="room">
      <img src={roomFor(unit)} alt="" className="room__photo" aria-hidden="true" />
      <div className="room__scrim" />
      <div className="room__rail" />
      <div className="room__floor" />

      <div className="room__inner px-4 sm:px-6 pt-5 pb-6">
        {/* Room sign, the way a real unit announces itself at the door */}
        <div className="flex items-center justify-center mb-6">
          <div
            className="inline-flex items-center gap-3 rounded-lg px-4 py-2 border border-white/20 bg-[#08161E]/70"
            style={{ boxShadow: `inset 3px 0 0 ${unit.hue}` }}
          >
            <span className="label text-white" style={{ fontSize: 10.5 }}>{unit.label}</span>
            <span className="w-px h-4 bg-white/20" />
            <span className="label text-white/60 nums" style={{ fontSize: 10 }}>
              {occupied} of {slots.length} beds occupied
            </span>
          </div>
        </div>

        <div className="bays grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {slots.map(s => (
            <Bay
              key={s.bedNumber}
              bedNumber={s.bedNumber}
              caseData={s.case}
              hue={unit.hue}
              done={s.case ? !!(done[`rich:${s.case.id}`] || done[s.case.id]) : false}
              onOpen={() => s.case && onOpenCase(s.case)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
