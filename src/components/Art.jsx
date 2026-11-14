import React from 'react';

/* The brand's generative glyph: every hospital, unit and case gets its own
   "vital sign" — a trace built from its id, in its section's colour. No two
   are the same, and none of them is a stock picture. */

const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function trace(id, w = 400, h = 120) {
  let seed = hash(id);
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const beats = 3 + Math.floor(rnd() * 3), mid = h * 0.58;
  let d = `M0 ${mid}`, x = 0;
  const step = w / beats;
  for (let b = 0; b < beats; b++) {
    const a = 0.55 + rnd() * 0.45, x0 = x + step * (0.18 + rnd() * 0.2);
    d += ` H${x0.toFixed(1)} q${step * 0.04} ${-h * 0.1 * a} ${step * 0.08} 0`;                        // P
    d += ` h${step * 0.05} l${step * 0.03} ${h * 0.1 * a} l${step * 0.05} ${-h * 0.62 * a} l${step * 0.05} ${h * 0.78 * a} l${step * 0.035} ${-h * 0.26 * a}`;   // QRS
    d += ` h${step * 0.07} q${step * 0.07} ${-h * 0.2 * a} ${step * 0.14} 0`;                           // T
    x += step;
  }
  return d + ` H${w}`;
}

export default function Glyph({ id, color = 'var(--lime)', className = '' }) {
  const g = 'g' + hash(id);
  const d = trace(id);
  return (
    <svg className={'glyph ' + className} viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" x2="1"><stop offset="0" stopColor={color} stopOpacity="0" /><stop offset=".25" stopColor={color} /><stop offset="1" stopColor="var(--violet)" /></linearGradient>
      </defs>
      <path d={d} fill="none" stroke={`url(#${g})`} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength="1" />
    </svg>
  );
}
