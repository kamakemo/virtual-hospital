import React, { useEffect, useRef } from 'react';

/* A bedside monitor: ECG lead II drawn from the current rhythm, an arterial
   line and a pleth, sweeping like the real thing. Numbers turn red and
   flash past alarm limits. */

const PQRST = p => (p < 0.09 ? Math.sin(p / 0.09 * Math.PI) * 0.12 : p < 0.15 ? 0 : p < 0.17 ? -0.1 : p < 0.19 ? -0.1 + (p - 0.17) / 0.02 * 1.1 : p < 0.215 ? 1 - (p - 0.19) / 0.025 * 1.3 : p < 0.24 ? -0.3 + (p - 0.215) / 0.025 * 0.3 : p < 0.33 ? 0 : p < 0.48 ? Math.sin((p - 0.33) / 0.15 * Math.PI) * 0.22 : 0);
const WIDE = p => (p < 0.06 ? 0 : p < 0.14 ? Math.sin((p - 0.06) / 0.08 * Math.PI) * 0.85 : p < 0.22 ? -Math.sin((p - 0.14) / 0.08 * Math.PI) * 0.35 : p < 0.3 ? 0 : p < 0.5 ? -Math.sin((p - 0.3) / 0.2 * Math.PI) * 0.25 : 0);

function ecgAt(rhythm, t, hr, seed) {
  if (rhythm === 'AF') {
    const beat = 60 / hr;
    const k = Math.floor(t / beat), jitter = Math.sin(k * 12.9898 + seed) * 0.45;
    const start = k * beat + jitter * beat * 0.5;
    const p = (t - start) / beat;
    const f = Math.sin(t * 40) * 0.04 + Math.sin(t * 57) * 0.03;
    return f + (p > 0.12 && p < 0.5 ? PQRST(p) * (p < 0.14 ? 0 : 1) : 0);
  }
  if (rhythm === 'CHB') {
    const pBeat = 60 / 80, qBeat = 60 / hr;
    const pp = (t % pBeat) / pBeat, qp = (t % qBeat) / qBeat;
    return (pp < 0.09 ? Math.sin(pp / 0.09 * Math.PI) * 0.12 : 0) + WIDE(qp);
  }
  const p = (t * hr / 60) % 1;
  if (/pace/i.test(rhythm)) return (p > 0.05 && p < 0.058 ? 1.1 : 0) + WIDE(Math.max(0, p - 0.02));
  if (rhythm === 'VF') return Math.sin(t * 31) * 0.4 + Math.sin(t * 47) * 0.3;
  return PQRST(p);
}

export default function Monitor({ v }) {
  const ref = useRef(null);
  const V = useRef(v); V.current = v;
  useEffect(() => {
    const c = ref.current, g = c.getContext('2d');
    let raf, w = 0, h = 0, x = 0, last = performance.now(), t0 = 0;
    const lines = [[], [], []];
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); w = c.clientWidth; h = c.clientHeight; c.width = w * d; c.height = h * d; g.setTransform(d, 0, 0, d, 0, 0); g.fillStyle = '#04070C'; g.fillRect(0, 0, w, h); x = 0; };
    size();
    const ro = new ResizeObserver(size); ro.observe(c);
    const loop = now => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const v = V.current, rows = h / 3;
      const steps = Math.max(1, Math.round(dt * 120));
      for (let k = 0; k < steps; k++) {
        t0 += dt / steps; x = (x + 1) % w;
        g.fillStyle = '#04070C'; g.fillRect(x, 0, 14, h);
        const hr = Math.max(20, v.hr || 60);
        const e = ecgAt(v.rhythm, t0, hr, 3.1);
        const beat = 60 / hr, bp = v.rhythm === 'CHB' ? (t0 % beat) / beat : v.rhythm === 'AF' ? ((t0 + Math.sin(Math.floor(t0 / beat) * 12.9) * beat * 0.22) % beat) / beat : ((t0 * hr / 60) % 1);
        const art = bp < 0.12 ? Math.sin(bp / 0.12 * Math.PI / 2) : bp < 0.3 ? 1 - (bp - 0.12) * 1.6 + (bp > 0.26 ? 0.1 : 0) : 0.62 * Math.exp(-(bp - 0.3) * 3);
        const pleth = Math.max(0, Math.sin(Math.max(0, bp - 0.08) * Math.PI * 1.1)) ** 1.5;
        const ys = [rows * 0.62 - e * rows * 0.5, rows + rows * 0.85 - art * rows * 0.65 * Math.min(1.2, (v.sbp - v.dbp) / 50 + 0.4), rows * 2 + rows * 0.85 - pleth * rows * 0.6 * (v.spo2 < 88 ? 0.5 : 1)];
        const cols = ['#35E08A', '#FF6B6B', '#5AC8FF'];
        ys.forEach((y, i) => {
          const pr = lines[i][x - 1];
          g.strokeStyle = cols[i]; g.lineWidth = 1.8; g.beginPath();
          g.moveTo(x - 1, pr ?? y); g.lineTo(x, y); g.stroke();
          lines[i][x] = y;
        });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  const al = { hr: v.hr > 130 || v.hr < 45, bp: v.sbp < 90, spo2: v.spo2 < 90, rr: v.rr > 28 };
  return (
    <div className="mon">
      <canvas ref={ref} aria-label={`Monitor: ${v.rhythm}, HR ${v.hr}, BP ${v.sbp}/${v.dbp}, SpO2 ${v.spo2}%`} />
      <div className="mon-nums">
        <div className={'n hr' + (al.hr ? ' al' : '')}><small>HR</small><b>{v.hr}</b><i>{v.rhythm}</i></div>
        <div className={'n bp' + (al.bp ? ' al' : '')}><small>ART</small><b>{v.sbp}/{v.dbp}</b><i>({Math.round((v.sbp + 2 * v.dbp) / 3)})</i></div>
        <div className={'n sp' + (al.spo2 ? ' al' : '')}><small>SpO₂</small><b>{v.spo2}</b><i>RR {v.rr}</i></div>
      </div>
    </div>
  );
}
