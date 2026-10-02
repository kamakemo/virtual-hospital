import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight, ChevronLeft, Search, X, Check, Loader2, ArrowUpRight,
} from 'lucide-react';

export const cx = (...a) => a.filter(Boolean).join(' ');

/* ============================================================
   ROUTER
   The whole route lives in history.state — no URL parsing, so a
   new screen costs a route name and nothing else.
   ============================================================ */

export function useRouter(initial = { name: 'home' }) {
  const [route, setRoute] = useState(
    () => (typeof window !== 'undefined' && window.history.state?.route) || initial
  );

  useEffect(() => {
    const onPop = e => setRoute(e.state?.route || initial);
    window.addEventListener('popstate', onPop);
    // Seed the first entry so Back from the second screen works.
    if (!window.history.state?.route) {
      window.history.replaceState({ route }, '');
    }
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback((next, { replace = false, keepScroll = false } = {}) => {
    if (replace) window.history.replaceState({ route: next }, '');
    else window.history.pushState({ route: next }, '');
    setRoute(next);
    if (!keepScroll) window.scrollTo(0, 0);
  }, []);

  return [route, navigate];
}

/* ============================================================
   PRIMITIVES
   ============================================================ */

/** The one container shape: flat, hairline-bordered, optional colour edge. */
export function Panel({ edge, as: As = 'div', className, children, ...rest }) {
  return (
    <As
      className={cx('bg-panel border border-line rounded-panel', className)}
      style={edge ? { borderLeft: `3px solid ${edge}` } : undefined}
      {...rest}
    >
      {children}
    </As>
  );
}

export function Eyebrow({ children, className }) {
  return <span className={cx('label text-accent-deep', className)}>{children}</span>;
}

export function Chip({ children, tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-sunk text-ink-2 border-line',
    accent:  'bg-accent-soft text-accent-deep border-accent/25',
    quiet:   'bg-transparent text-ink-3 border-line',
  };
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium whitespace-nowrap',
        tones[tone], className
      )}
    >
      {children}
    </span>
  );
}

export function SeverityTag({ severity }) {
  const map = {
    stable:   { label: 'Stable',   color: '#0F766E', bg: '#E8F2F0' },
    urgent:   { label: 'Urgent',   color: '#A8620F', bg: '#F7F0E4' },
    critical: { label: 'Critical', color: '#AE2A22', bg: '#F9EDEB' },
  };
  const s = map[severity];
  if (!s) return null;
  return (
    <span
      className="label inline-flex items-center px-1.5 py-0.5 rounded"
      style={{ color: s.color, background: s.bg, fontSize: 9.5 }}
    >
      {s.label}
    </span>
  );
}

/** Hairline progress indicator. Fraction 0–1. */
export function Progress({ value = 0, color = 'var(--accent)', className }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cx('h-[3px] bg-line-soft rounded-full overflow-hidden', className)}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function SectionHead({ eyebrow, title, meta, action, className }) {
  return (
    <div className={cx('flex items-end justify-between gap-5 flex-wrap mb-5', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5"><Eyebrow>{eyebrow}</Eyebrow></div>}
        <h2 className="display text-2xl sm:text-[27px] leading-tight text-ink">{title}</h2>
        {meta && <p className="text-sm text-ink-3 mt-1">{meta}</p>}
      </div>
      {action}
    </div>
  );
}

export function Breadcrumb({ trail }) {
  return (
    <nav className="flex items-center gap-1.5 text-[13px] text-ink-3 flex-wrap mb-5" aria-label="Breadcrumb">
      {trail.map((t, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={12} className="text-line shrink-0" aria-hidden="true" />}
          {t.onClick ? (
            <button onClick={t.onClick} className="hover:text-accent-deep transition-colors truncate max-w-[22ch] sm:max-w-none">
              {t.label}
            </button>
          ) : (
            <span className="text-ink-2 font-medium truncate max-w-[30ch] sm:max-w-none">{t.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function BackLink({ onClick, children = 'Back' }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-[13px] text-ink-3 hover:text-accent-deep transition-colors">
      <ChevronLeft size={13} /> {children}
    </button>
  );
}

export function Button({ variant = 'primary', size = 'md', as: As = 'button', className, children, ...rest }) {
  const variants = {
    primary: 'bg-accent text-white border-accent hover:bg-accent-deep',
    quiet:   'bg-panel text-ink-2 border-line hover:border-accent/40 hover:text-accent-deep',
    ghost:   'bg-transparent text-ink-2 border-transparent hover:bg-sunk',
    danger:  'bg-panel text-crit border-crit/30 hover:bg-crit/5',
  };
  const sizes = {
    sm: 'px-2.5 py-1 text-[12px]',
    md: 'px-3.5 py-1.5 text-[13px]',
    lg: 'px-5 py-2.5 text-[14px]',
  };
  return (
    <As
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded border font-medium transition-colors',
        variants[variant], sizes[size], className
      )}
      {...rest}
    >
      {children}
    </As>
  );
}

export function SearchField({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cx('relative', className)}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-panel border border-line rounded py-2 pl-9 pr-8 text-[14px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

export function Loading({ label = 'Loading…', className }) {
  return (
    <div className={cx('flex items-center justify-center gap-2 py-16 text-ink-3 text-sm', className)}>
      <Loader2 size={15} className="animate-spin" aria-hidden="true" /> {label}
    </div>
  );
}

export function EmptyState({ title, body, action, icon: Icon }) {
  return (
    <div className="border border-dashed border-line rounded-panel py-14 px-8 text-center">
      {Icon && <Icon size={22} className="mx-auto mb-3 text-ink-3" aria-hidden="true" />}
      <h3 className="display text-lg text-ink mb-1.5">{title}</h3>
      {body && <p className="text-sm text-ink-3 max-w-[48ch] mx-auto leading-relaxed">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Label/value pair in a hairline-ruled row. Use in lists, not as a card. */
export function DataRow({ label, value, className }) {
  return (
    <div className={cx('flex items-baseline justify-between gap-6 py-2.5 border-b border-line-soft last:border-0', className)}>
      <dt className="text-[13px] text-ink-3">{label}</dt>
      <dd className="text-[14px] text-ink font-medium nums text-right">{value}</dd>
    </div>
  );
}

export function Done({ children = 'Completed' }) {
  return (
    <span className="inline-flex items-center gap-1 label text-good" style={{ fontSize: 10 }}>
      <Check size={11} strokeWidth={3} /> {children}
    </span>
  );
}

/* A hairline-ruled band used to separate major page regions. */
export function Divider({ className }) {
  return <hr className={cx('border-0 border-t border-line', className)} />;
}

export { ArrowUpRight, ChevronRight, ChevronLeft, useRef };
