import React, { useEffect, useRef } from 'react';

/* ============================================================
   PATIENT MONITOR
   ECG (lead II), invasive arterial pressure, SpO₂ pleth, with
   the numbers. Values glide toward whatever the scenario sets,
   so a falling blood pressure falls in front of you.
   ============================================================ */

function useCanvas(ref, h, draw, deps = []) {
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d');
    let raf, w = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(c);
    const start = performance.now();
    const loop = now => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(g, w, h, (now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
export { useCanvas };

/** One beat of lead II; st shifts the ST segment (mm-ish, negative = depression). */
export function ecgBeat(x, st = 0) {
  if (x < 0.08) return Math.sin(x / 0.08 * Math.PI) * 0.12;          // P
  if (x < 0.14) return 0;
  if (x < 0.16) return -0.12;                                         // Q
  if (x < 0.19) return 1;                                             // R
  if (x < 0.22) return -0.28;                                         // S
  if (x < 0.36) return st * 0.1;                                      // ST
  if (x < 0.5) return st * 0.1 * (1 - (x - 0.36) / 0.14) + Math.sin((x - 0.36) / 0.14 * Math.PI) * (st < -1 ? 0.06 : 0.22); // T
  return 0;
}
/** A broad escape or paced complex (~160 ms) with discordant T. */
function wideBeat(x) {
  if (x < 0.07 || x > 0.6) return 0;
  if (x < 0.25) return Math.sin((x - 0.07) / 0.18 * Math.PI) * 0.85;
  if (x < 0.32) return -0.08;
  return -Math.sin((x - 0.32) / 0.28 * Math.PI) * 0.3;
}
function artWave(x) {
  if (x < 0.12) return Math.sin(x / 0.12 * Math.PI / 2);
  if (x < 0.3) return 1 - (x - 0.12) * 1.3;
  if (x < 0.33) return 0.74 + (x - 0.3) * 1.6;                        // dicrotic notch
  return Math.max(0, 0.79 - (x - 0.33) * 1.2);
}
function plethWave(x) {
  if (x < 0.22) return Math.sin(x / 0.22 * Math.PI / 2);
  return Math.max(0, 1 - (x - 0.22) * 1.25) + (x > 0.38 && x < 0.48 ? 0.08 : 0);
}

export default function Monitor({ vitals }) {
  const ref = useRef(null);
  const live = useRef({ ...vitals });
  const target = useRef(vitals);
  target.current = vitals;

  useCanvas(ref, 214, (g, w, h, t) => {
    const L = live.current, T = target.current;
    for (const k of ['hr', 'sys', 'dia', 'spo2', 'rr']) if (typeof T[k] === 'number') L[k] += (T[k] - L[k]) * 0.05;
    L.st = T.st || 0;
    const rhythm = T.rhythm || 'sinus';
    // complete heart block: P waves march on at ~80; slow wide escape beats ignore them
    const ecg = rhythm === 'chb'
      ? (ph, t0) => { const pa = (t0 * 1.35) % 1; return (pa < 0.11 ? Math.sin(pa / 0.11 * Math.PI) * 0.12 : 0) + wideBeat(ph % 1); }
      : rhythm === 'paced' ? ph => { const x = ph % 1; return (x > 0.06 && x < 0.07 ? 1.3 : 0) + wideBeat(x); }
      : rhythm === 'af' ? (ph, t0) => { const x = ph % 1; return (x < 0.12 ? 0 : ecgBeat(x, L.st)) + 0.05 * Math.sin(t0 * 37) + 0.035 * Math.sin(t0 * 53 + 1); }
      : ph => ecgBeat(ph % 1, L.st);
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const traceW = w - 86;
    const rows = [
      { y: 40, amp: 26, color: '#38E07A', label: 'II', fn: ecg, rate: L.hr / 60, ecg: true },
      { y: 112, amp: 40, color: '#FF5A52', label: 'ART', fn: p => artWave(p % 1), rate: L.hr / 60, base: 0.25 },
      { y: 182, amp: 22, color: '#3ED0F5', label: 'Pleth', fn: p => plethWave(p % 1), rate: L.hr / 60 },
    ];
    const sweep = (t * 60) % traceW;
    for (const r of rows) {
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.font = '600 9px "IBM Plex Mono", monospace';
      g.fillText(r.label, 4, r.y - r.amp - 2);
      g.strokeStyle = r.color; g.lineWidth = 1.6; g.beginPath();
      let pen = false;
      for (let x = 0; x < traceW; x += 1.5) {
        if (Math.abs(x - sweep) < 7) { pen = false; continue; }
        const age = x <= sweep ? sweep - x : sweep + traceW - x;
        if (t - age / 60 < 0) { pen = false; continue; }     // nothing recorded before the monitor was connected
        const T0 = t - age / 60;
        // AF: the beats arrive irregularly — warp time for every trace so pulse and ECG stay together
        const ph = T0 * r.rate + (rhythm === 'af' ? 0.45 * Math.sin(T0 * 1.7) + 0.3 * Math.sin(T0 * 2.9 + 1) : 0);
        let v = r.ecg ? r.fn(ph, t - age / 60) : r.fn(ph);
        if (r.label === 'ART') v = v * (L.sys - L.dia) / 80;          // pulse pressure scales the wave
        const y = r.y - v * r.amp;
        if (!pen) { g.moveTo(x, y); pen = true; } else g.lineTo(x, y);
      }
      g.stroke();
    }
    // numbers
    const nx = w - 80;
    g.textAlign = 'right';
    g.fillStyle = '#38E07A'; g.font = '700 30px "IBM Plex Mono", monospace'; g.fillText(Math.round(L.hr), w - 6, 46);
    g.font = '600 9px "IBM Plex Mono", monospace'; g.fillText('HR', w - 6, 14);
    const low = L.sys < 90;
    g.fillStyle = low && Math.floor(t * 2) % 2 ? '#FFFFFF' : '#FF5A52';
    g.font = '700 21px "IBM Plex Mono", monospace'; g.fillText(`${Math.round(L.sys)}/${Math.round(L.dia)}`, w - 6, 112);
    g.font = '500 12px "IBM Plex Mono", monospace'; g.fillText(`(${Math.round((L.sys + 2 * L.dia) / 3)})`, w - 6, 128);
    g.font = '600 9px "IBM Plex Mono", monospace'; g.fillText('ART', w - 6, 84);
    g.fillStyle = '#3ED0F5'; g.font = '700 26px "IBM Plex Mono", monospace'; g.fillText(Math.round(L.spo2), w - 6, 190);
    g.font = '600 9px "IBM Plex Mono", monospace'; g.fillText('SpO₂', w - 6, 160);
    g.fillStyle = '#F2D24B'; g.font = '600 12px "IBM Plex Mono", monospace'; g.fillText(`RR ${Math.round(L.rr || 16)}`, w - 6, 208);
    g.textAlign = 'left';
    g.strokeStyle = '#1A2632'; g.beginPath(); g.moveTo(nx - 4, 0); g.lineTo(nx - 4, h); g.stroke();
  });

  return <canvas ref={ref} className="cs-canvas" style={{ height: 214 }} aria-label={`Heart rate ${vitals.hr}, blood pressure ${vitals.sys} over ${vitals.dia}, SpO2 ${vitals.spo2}%`} />;
}
