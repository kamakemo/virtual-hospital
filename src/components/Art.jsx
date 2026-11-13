import React from 'react';

/* Drawn "cover photos": every hospital, centre, unit and case gets a
   deterministic illustration in its own colour — layered gradients, a
   motif (ECG trace, cells, rings, grid, waves) and a large icon. */

const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function Art({ id, color = '#C4122F', icon, className = '', dark = false, motif }) {
  const h = hash(id);
  const m = motif || ['ecg', 'cells', 'rings', 'grid', 'waves'][h % 5];
  const g = `g${h}`, r = `r${h}`;
  const x = 280 + (h % 220), y = 60 + (h % 120);
  return (
    <svg className={'art ' + className} viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={dark ? '#14141A' : color} />
          <stop offset="1" stopColor={dark ? color : '#1B1B22'} />
        </linearGradient>
        <radialGradient id={r} cx="0.7" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="450" fill={`url(#${g})`} />
      <rect width="800" height="450" fill={`url(#${r})`} />
      {m === 'ecg' && <path d="M0 300 H180 l20 -70 22 140 20 -190 24 210 18 -90 H460 l16 -34 16 34 H620 l20 -70 22 140 20 -190 24 210 18 -90 H800" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="6" strokeLinejoin="round" />}
      {m === 'cells' && [...Array(14)].map((_, i) => <circle key={i} cx={(h * (i + 3) * 37) % 800} cy={(h * (i + 5) * 53) % 450} r={18 + ((h >>> i) % 40)} fill="#fff" fillOpacity={0.06 + ((h >>> (i + 2)) % 4) * 0.03} />)}
      {m === 'rings' && [...Array(7)].map((_, i) => <circle key={i} cx={x + 160} cy={y + 120} r={50 + i * 46} fill="none" stroke="#fff" strokeOpacity={0.22 - i * 0.025} strokeWidth="3" />)}
      {m === 'grid' && [...Array(12)].map((_, i) => <g key={i}><line x1={i * 72} y1="0" x2={i * 72} y2="450" stroke="#fff" strokeOpacity="0.08" /><line x1="0" y1={i * 42} x2="800" y2={i * 42} stroke="#fff" strokeOpacity="0.08" /></g>)}
      {m === 'waves' && [0, 1, 2, 3].map(i => <path key={i} d={`M0 ${260 + i * 40} C 200 ${200 + i * 40}, 400 ${330 + i * 40}, 800 ${240 + i * 40}`} fill="none" stroke="#fff" strokeOpacity={0.3 - i * 0.06} strokeWidth="5" />)}
      <circle cx={680} cy={360} r="120" fill="#fff" fillOpacity="0.07" />
      <circle cx={110} cy={80} r="70" fill="#fff" fillOpacity="0.05" />
      {icon && <text x="610" y="250" fontSize="190" textAnchor="middle" dominantBaseline="middle" opacity="0.92">{icon}</text>}
    </svg>
  );
}
