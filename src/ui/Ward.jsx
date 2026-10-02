import React from 'react';
import { cx, SeverityTag, Progress } from './kit.jsx';

/* ============================================================
   WARD FLOOR
   Only the time-critical units get one (unit.ward === true):
   Emergency, Coronary Care, Cath Lab, EP Lab, Critical Care.
   Everywhere else a bed would be a decoration, so the unit
   shows a case index instead.

   Drawn, not photographed — line work and flat fills that sit
   inside the light design rather than fighting it.
   ============================================================ */

const TRACE = {
  critical: { stroke: '#F87171', dur: '2.1s' },
  urgent:   { stroke: '#FBBF24', dur: '2.9s' },
  stable:   { stroke: '#4ADE80', dur: '3.6s' },
};

/** One ECG cycle, repeated; the group slides to give a running trace. */
function MonitorTrace({ severity }) {
  const t = TRACE[severity] || TRACE.stable;
  const cycle = 'l12,0 l4,-3 l3,5 l2,-14 l3,23 l3,-11 l5,0 c3,-7 7,-7 10,0 l15,0';
  const path = 'M0,15' + cycle.repeat(6);
  return (
    <svg viewBox="0 0 171 30" preserveAspectRatio="none" className="w-full h-[26px] block" aria-hidden="true">
      <g>
        <path d={path} fill="none" stroke={t.stroke} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <animateTransform
          attributeName="transform" type="translate"
          from="0 0" to="-171 0" dur={t.dur} repeatCount="indefinite"
        />
      </g>
    </svg>
  );
}

/** A hospital bed: chrome base on castors, blue boards, pale linen. */
function BedArt({ occupied }) {
  const frame  = occupied ? '#3F5E93' : '#A7B4C2';
  const panel  = occupied ? '#DBE6F7' : '#E6EBF1';
  const linen  = occupied ? '#EFF5FC' : '#EDEFF3';
  const rail   = occupied ? '#5A78AE' : '#AFBAC7';
  return (
    <svg viewBox="0 0 260 150" className="w-full h-auto block" style={{ maxWidth: 260 }} aria-hidden="true">
      <ellipse cx="132" cy="141" rx="108" ry="6" fill="#0F1A20" opacity="0.07" />
      {[46, 96, 166, 216].map(x => (
        <g key={x}>
          <circle cx={x} cy="133" r="7" fill="#8795A5" />
          <circle cx={x} cy="133" r="2.6" fill="#D5DCE4" />
        </g>
      ))}
      <path d="M50,132 L96,112 M96,132 L50,112 M166,132 L216,112 M216,132 L166,112"
        stroke="#B6C0CB" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <rect x="44" y="105" width="178" height="8" rx="4" fill="#C8D1DA" />
      <rect x="212" y="68" width="19" height="44" rx="6" fill={frame} />
      <rect x="216" y="74" width="11" height="26" rx="4" fill={panel} />
      <rect x="29" y="44" width="21" height="68" rx="7" fill={frame} />
      <rect x="33" y="54" width="13" height="40" rx="5" fill={panel} />
      <rect x="46" y="86" width="172" height="11" rx="4" fill="#9FB2CC" />
      <rect x="48" y="70" width="168" height="20" rx="9" fill={linen} stroke="#D7E3F1" strokeWidth="1.5" />
      {occupied && (
        <>
          <path d="M128,72 h82 a8,8 0 0 1 8,8 v4 a4,4 0 0 1 -4,4 h-86 z" fill="#C3D7F1" />
          <g transform="rotate(-8 80 64)">
            <rect x="53" y="57" width="52" height="17" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
          </g>
        </>
      )}
      <rect x="58" y="74" width="154" height="15" rx="6" fill={rail} />
      {[74, 97, 120, 143, 166, 189].map(x => (
        <rect key={x} x={x} y="79" width="3.5" height="8" rx="1.8" fill={occupied ? '#35507F' : '#92A0AF'} />
      ))}
    </svg>
  );
}

function Bay({ bedNumber, caseData, hue, done, onOpen }) {
  const c = caseData;
  const occupied = !!c;

  return (
    <div className={cx('border border-line rounded-panel overflow-hidden bg-panel flex flex-col',
      !occupied && 'border-dashed bg-paper')}>
      {/* Headwall: bed number, severity, gas outlets */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-line-soft bg-sunk/70">
        <span className="label nums text-ink-3" style={{ fontSize: 9.5 }}>Bed {bedNumber}</span>
        {c && <SeverityTag severity={c.severity} />}
        <span className="ml-auto flex items-center gap-1" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-sm bg-white border border-line" title="Oxygen" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#3B4654]" title="Air" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#E9C23F]" title="Suction" />
        </span>
      </div>

      {/* Monitor */}
      <div className="bg-[#0B1118] px-2 pt-1.5 pb-1">
        {occupied ? (
          <>
            <MonitorTrace severity={c.severity} />
            <div className="flex items-center justify-between font-mono text-[9.5px] leading-none pb-0.5 nums">
              <span style={{ color: TRACE[c.severity]?.stroke || '#4ADE80' }}>
                {c.vitals?.hr || '--'}<span className="text-[7px] text-[#6B7F96] ml-0.5">bpm</span>
              </span>
              <span className="text-[#67C7F5]">
                {c.vitals?.spo2 || '--'}<span className="text-[7px] text-[#6B7F96] ml-0.5">%</span>
              </span>
              <span className="text-[#A5B4C8]">{c.vitals?.bp || '--/--'}</span>
            </div>
          </>
        ) : (
          <div className="h-[36px] flex items-center justify-center font-mono text-[9px] text-[#556679] label">Standby</div>
        )}
      </div>

      {/* Bed */}
      <div className="px-3 pt-3 pb-1 relative"
        style={{ backgroundImage: 'linear-gradient(#EDF1F5 1px, transparent 1px), linear-gradient(90deg, #EDF1F5 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
        {occupied && (
          <span className="absolute left-3 bottom-2 flex flex-col items-center pointer-events-none" aria-hidden="true">
            <span className="w-2.5 h-3.5 rounded-sm bg-[#DCEBF8] border border-[#BBD4EA]" />
            <span className="w-[2px] h-14 bg-[#C3CBD6]" />
          </span>
        )}
        <BedArt occupied={occupied} />
      </div>

      {/* Case plate — the click target */}
      <div className="p-3 pt-1.5 mt-auto border-t border-line-soft">
        {occupied ? (
          <>
            <button onClick={onOpen} className="block text-left w-full group">
              <span className="block text-[13.5px] font-medium leading-snug text-ink group-hover:text-accent-deep">
                {c.title}
              </span>
              {c.chiefComplaint && (
                <span className="block text-[12px] text-ink-3 mt-0.5 line-clamp-2 leading-snug">{c.chiefComplaint}</span>
              )}
            </button>
            <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-ink-3 nums">
              <span className="truncate">
                {c.profile?.age ? `${c.profile.age}${(c.profile.sex || '')[0] || ''}` : '—'}
                {c.profile?.name ? ` · ${c.profile.name}` : ''}
              </span>
              {done && <span className="text-good label" style={{ fontSize: 9 }}>Done</span>}
            </div>
            <Progress value={done ? 1 : 0} color={hue} className="mt-1.5" />
          </>
        ) : (
          <p className="label text-ink-3 text-center py-1" style={{ fontSize: 9.5 }}>Bed available</p>
        )}
      </div>
    </div>
  );
}

export default function WardFloor({ unit, cases, progress, onOpenCase }) {
  // Explicit bed numbers win; everything else fills the first free slot, so a
  // unit whose cases carry no bed number still lays out tidily in order.
  const done = progress?.completedStages || {};
  const withBed = cases.filter(c => Number.isFinite(c.bedNumber) && c.bedNumber > 0);
  const withoutBed = cases.filter(c => !(Number.isFinite(c.bedNumber) && c.bedNumber > 0));

  const taken = new Set(withBed.map(c => c.bedNumber));
  const total = Math.max(cases.length + 2, 6, ...(withBed.length ? withBed.map(c => c.bedNumber) : [0]));

  const slots = [];
  let queue = [...withoutBed];
  for (let n = 1; n <= total; n++) {
    const pinned = withBed.find(c => c.bedNumber === n);
    slots.push({ bedNumber: n, case: pinned || (taken.has(n) ? null : queue.shift() || null) });
  }

  const occupied = slots.filter(s => s.case).length;

  return (
    <div className="border border-line rounded-panel overflow-hidden bg-panel">
      {/* Room backdrop: a window band above the bays */}
      <div className="border-b border-line-soft bg-gradient-to-b from-[#E8F1F8] to-panel pt-6 pb-3">
        <div className="flex justify-center gap-10" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-32 h-[72px] rounded border-2 border-line hidden sm:block"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,.8) 0 8px, rgba(186,212,235,.55) 8px 11px), linear-gradient(180deg,#D5E9FA,#F4FAFF)',
              }}
            />
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <span className="label text-ink-3 bg-panel px-3 py-1 rounded-full border border-line" style={{ fontSize: 9.5 }}>
            {unit.label} · {occupied} of {slots.length} beds occupied
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-5 bg-paper">
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
  );
}
