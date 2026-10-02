import React, { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { cx } from './kit.jsx';
import { DEPARTMENTS, HOSPITAL } from '../data/curriculum.js';

/** Hospital mark — a thin-line monogram, drawn not photographed. */
export function Mark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 16.5h4.2l1.7-4.6 2.6 9.2 2.3-6.1 1.5 3.1h2.3"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M24 11.5v6M21 14.5h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function NavItem({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'relative py-3 text-[13.5px] font-medium transition-colors',
        active ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
      )}
    >
      {children}
      {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-accent" />}
    </button>
  );
}

export function TopBar({ route, navigate, session, onSignOut }) {
  const [open, setOpen] = useState(false);
  const at = route?.name;
  const inDept = id => (at === 'department' || at === 'unit' || at === 'cases' || at === 'library')
    && route.deptId === id;

  const go = next => { setOpen(false); navigate(next); };

  const items = [
    ...DEPARTMENTS.map(d => ({
      key: d.id,
      label: d.label,
      active: inDept(d.id),
      onClick: () => go({ name: 'department', deptId: d.id }),
    })),
    {
      key: 'conferences',
      label: 'Conferences',
      active: at === 'conferences' || at === 'conference' || at === 'session',
      onClick: () => go({ name: 'conferences' }),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-line">
      <div className="max-w-shell mx-auto px-5 sm:px-7">
        <div className="flex items-center gap-6">
          <button
            onClick={() => go({ name: 'home' })}
            className="flex items-center gap-2.5 py-2.5 text-accent-deep shrink-0"
            aria-label={`${HOSPITAL.name} — home`}
          >
            <Mark />
            <span className="hidden sm:block text-left leading-none">
              <span className="display block text-[15.5px] text-ink">{HOSPITAL.name}</span>
              <span className="label block text-ink-3 mt-1" style={{ fontSize: 9 }}>Cardiology · Internal Medicine</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-7 ml-auto" aria-label="Main">
            {items.map(i => (
              <NavItem key={i.key} active={i.active} onClick={i.onClick}>{i.label}</NavItem>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 pl-5 border-l border-line">
            <span className="flex items-center gap-1.5 text-[12px] text-ink-3 max-w-[18ch] truncate" title={session?.user?.email}>
              <User size={12} aria-hidden="true" />
              {session?.user?.email?.split('@')[0] || 'Guest'}
            </span>
            {session && (
              <button onClick={onSignOut} className="text-ink-3 hover:text-crit transition-colors" title="Sign out" aria-label="Sign out">
                <LogOut size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden ml-auto p-2 -mr-2 text-ink-2"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-panel">
          <div className="max-w-shell mx-auto px-5 py-2">
            {items.map(i => (
              <button
                key={i.key}
                onClick={i.onClick}
                className={cx(
                  'block w-full text-left py-2.5 text-[14px] border-b border-line-soft last:border-0',
                  i.active ? 'text-accent-deep font-medium' : 'text-ink-2'
                )}
              >
                {i.label}
              </button>
            ))}
            {session && (
              <button onClick={() => { setOpen(false); onSignOut(); }} className="flex items-center gap-2 w-full py-2.5 text-[14px] text-ink-3">
                <LogOut size={13} /> Sign out · {session.user?.email}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer({ navigate, counts }) {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="max-w-shell mx-auto px-5 sm:px-7 py-10">
        <div className="flex flex-wrap gap-10 justify-between">
          <div className="max-w-[34ch]">
            <div className="flex items-center gap-2 text-accent-deep mb-2">
              <Mark size={20} />
              <span className="display text-[15px] text-ink">{HOSPITAL.name}</span>
            </div>
            <p className="text-[13px] text-ink-3 leading-relaxed">
              A teaching hospital that exists only as curriculum. Every case is written to be
              worked through, not read.
            </p>
          </div>

          <div>
            <div className="label text-ink-3 mb-3">Departments</div>
            <ul className="space-y-1.5">
              {DEPARTMENTS.map(d => (
                <li key={d.id}>
                  <button
                    onClick={() => navigate({ name: 'department', deptId: d.id })}
                    className="text-[13px] text-ink-2 hover:text-accent-deep"
                  >
                    {d.label} <span className="text-ink-3 nums">· {d.units.length} units</span>
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => navigate({ name: 'conferences' })} className="text-[13px] text-ink-2 hover:text-accent-deep">
                  Conferences
                </button>
              </li>
            </ul>
          </div>

          {counts && (
            <div>
              <div className="label text-ink-3 mb-3">In the hospital</div>
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex gap-3 justify-between"><dt className="text-ink-3">Cases</dt><dd className="text-ink-2 nums">{counts.cases}</dd></div>
                <div className="flex gap-3 justify-between"><dt className="text-ink-3">Units</dt><dd className="text-ink-2 nums">{counts.units}</dd></div>
                <div className="flex gap-3 justify-between"><dt className="text-ink-3">Library topics</dt><dd className="text-ink-2 nums">{counts.library}</dd></div>
                <div className="flex gap-3 justify-between"><dt className="text-ink-3">Conferences</dt><dd className="text-ink-2 nums">{counts.conferences}</dd></div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

/** Standard page frame: max width, gutters, route-keyed fade. */
export function Page({ children, wide = false, className }) {
  return (
    <main className={cx('page-in mx-auto px-5 sm:px-7 py-8 sm:py-11', wide ? 'max-w-[1480px]' : 'max-w-shell', className)}>
      {children}
    </main>
  );
}
