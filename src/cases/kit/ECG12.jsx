import React, { useEffect, useRef } from 'react';

/* ============================================================
   12-LEAD ECG
   Rendered on calibrated paper: 25 mm/s, 10 mm/mV, 1 mm minor
   and 5 mm major squares, the standard 3 × 4 layout plus a
   rhythm strip. Each lead takes an ST offset (mm, + elevation,
   − depression) and a T-wave polarity, so ischaemic patterns
   can be drawn faithfully.
   ============================================================ */

const LAYOUT = [['I', 'aVR', 'V1', 'V4'], ['II', 'aVL', 'V2', 'V5'], ['III', 'aVF', 'V3', 'V6']];

// lead morphology: R/S amplitudes in mm, so the axis and R-wave progression look right
const SHAPE = {
  I: { r: 7, s: 1 }, II: { r: 10, s: 1.5 }, III: { r: 5, s: 2 }, aVR: { r: 1, s: 7, inv: true },
  aVL: { r: 4, s: 1 }, aVF: { r: 7, s: 1.5 }, V1: { r: 2, s: 9 }, V2: { r: 4, s: 12 }, V3: { r: 8, s: 8 },
  V4: { r: 14, s: 4 }, V5: { r: 13, s: 2 }, V6: { r: 10, s: 1 },
};

function beatY(x, lead, st = 0, tInv = false) {
  // x in seconds within the beat; returns mm (positive up)
  const sh = SHAPE[lead];
  const p = sh.inv ? -1 : 1;
  if (x < 0.09) return p * Math.sin(x / 0.09 * Math.PI) * 1.2;
  if (x < 0.15) return 0;
  if (x < 0.165) return -0.8 * p;
  if (x < 0.195) return sh.r * Math.sin((x - 0.165) / 0.03 * Math.PI);
  if (x < 0.23) return -sh.s * Math.sin((x - 0.195) / 0.035 * Math.PI);
  if (x < 0.34) return st;
  if (x < 0.5) {
    const k = (x - 0.34) / 0.16;
    const tAmp = (tInv ? -2.2 : sh.inv ? -2 : 3) * Math.sin(k * Math.PI);
    return st * (1 - k) + tAmp;
  }
  return 0;
}

export default function ECG12({ rate = 96, st = {}, tInv = {}, caption, height = 330 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth, h = height;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      const g = c.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // paper: 10 s across the width at 25 mm/s → 250 mm
      const mm = w / 250;
      g.fillStyle = '#FFF6F4'; g.fillRect(0, 0, w, h);
      for (let x = 0; x <= w; x += mm) { g.strokeStyle = (Math.round(x / mm) % 5 === 0) ? 'rgba(220,90,90,0.55)' : 'rgba(240,160,160,0.35)'; g.lineWidth = (Math.round(x / mm) % 5 === 0) ? 0.9 : 0.4; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (let y = 0; y <= h; y += mm) { g.strokeStyle = (Math.round(y / mm) % 5 === 0) ? 'rgba(220,90,90,0.55)' : 'rgba(240,160,160,0.35)'; g.lineWidth = (Math.round(y / mm) % 5 === 0) ? 0.9 : 0.4; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }

      const rr = 60 / rate;
      const rowH = h / 4;
      g.strokeStyle = '#1B1B1B'; g.lineWidth = 1.25; g.lineJoin = 'round';
      const trace = (lead, x0, x1, yc) => {
        g.beginPath();
        for (let px = x0; px <= x1; px += 0.6) {
          const sec = (px - x0) / mm / 25;
          const yy = yc - beatY(sec % rr, lead, st[lead] || 0, !!tInv[lead]) * mm;
          px === x0 ? g.moveTo(px, yy) : g.lineTo(px, yy);
        }
        g.stroke();
      };
      LAYOUT.forEach((row, r) => row.forEach((lead, k) => {
        const x0 = k * w / 4 + 2, x1 = (k + 1) * w / 4 - 2, yc = rowH * r + rowH * 0.6;
        trace(lead, x0, x1, yc);
        g.fillStyle = '#1B1B1B'; g.font = '600 11px Archivo, sans-serif'; g.fillText(lead, x0 + 4, rowH * r + 14);
        if (k > 0) { g.strokeStyle = '#1B1B1B'; g.beginPath(); g.moveTo(x0 - 2, yc - 5 * mm); g.lineTo(x0 - 2, yc + 2 * mm); g.stroke(); }
      }));
      trace('II', 2, w - 2, rowH * 3 + rowH * 0.6);
      g.fillStyle = '#1B1B1B'; g.fillText('II (rhythm)', 6, rowH * 3 + 14);
      g.font = '500 10px "IBM Plex Mono", monospace';
      g.fillText(`25 mm/s · 10 mm/mV · ${rate} bpm`, w - 190, h - 6);
    };
    draw();
    const ro = new ResizeObserver(draw); ro.observe(c);
    return () => ro.disconnect();
  }, [rate, JSON.stringify(st), JSON.stringify(tInv), height]);

  return (
    <figure className="cs-fig" style={{ background: '#FFF6F4' }}>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height }} aria-label={caption || '12-lead ECG'} />
      {caption && <figcaption style={{ background: 'var(--panel)' }}>{caption}</figcaption>}
    </figure>
  );
}
