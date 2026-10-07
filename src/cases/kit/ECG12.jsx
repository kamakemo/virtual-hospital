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

// leads whose QRS points toward the left ventricle: tall and broad in LBBB
const LEFTWARD = new Set(['I', 'aVL', 'V5', 'V6']);
const RIGHTWARD = new Set(['V1', 'V2', 'V3', 'aVR', 'III']);

function pWave(x, sh) { return x >= 0 && x < 0.09 ? (sh.inv ? -1 : 1) * Math.sin(x / 0.09 * Math.PI) * 1.2 : 0; }

/** QRS–ST–T, x in seconds from QRS onset; returns mm. */
function qrst(x, lead, sh, st, tInv, wide) {
  const p = sh.inv ? -1 : 1;
  if (x < 0) return 0;
  if (wide) {
    // left bundle branch block (or RV pacing): 150 ms QRS, discordant ST–T
    const left = LEFTWARD.has(lead), right = RIGHTWARD.has(lead);
    if (x < 0.15) {
      const k = x / 0.15;
      if (left) return sh.r * 1.05 * Math.sin(k * Math.PI) * (1 - 0.22 * Math.exp(-(((k - 0.5) / 0.1) ** 2)));   // broad, notched R
      if (right) return -Math.max(sh.s, 9) * 1.15 * Math.sin(k * Math.PI);                                 // deep, broad QS
      return (sh.r * 0.5 * Math.sin(Math.min(1, k * 2) * Math.PI) - sh.s * 0.6 * Math.sin(Math.max(0, k * 2 - 1) * Math.PI));
    }
    const disc = left ? -1.6 : right ? 1.8 : 0.3;
    if (x < 0.24) return disc;
    if (x < 0.42) { const k = (x - 0.24) / 0.18; return disc * (1 - k) + (left ? -2.6 : right ? 3 : 1) * Math.sin(k * Math.PI); }
    return 0;
  }
  if (x < 0.015) return -0.8 * p;
  if (x < 0.045) return sh.r * Math.sin((x - 0.015) / 0.03 * Math.PI);
  if (x < 0.08) return -sh.s * Math.sin((x - 0.045) / 0.035 * Math.PI);
  if (x < 0.19) return st;
  if (x < 0.35) {
    const k = (x - 0.19) / 0.16;
    const tAmp = (tInv ? -2.2 : sh.inv ? -2 : 3) * Math.sin(k * Math.PI);
    return st * (1 - k) + tAmp;
  }
  return 0;
}

/**
 * Voltage at time sec (from the start of the strip), in mm.
 * rhythm: 'sinus' | 'chb' (P waves march through at atrialRate, dissociated
 * from a slow wide escape) | 'paced' (pacing spike, then a wide complex).
 */
function voltage(sec, lead, o) {
  const sh = { ...SHAPE[lead], ...(o.shape[lead] || {}) };
  const rr = 60 / o.rate;
  if (o.rhythm === 'af') {
    // irregularly irregular: the last QRS onset before this moment, on a fibrillating baseline
    let k = 0; while (k + 1 < o.onsets.length && o.onsets[k + 1] <= sec) k++;
    const f = 0.35 * Math.sin(sec * 2 * Math.PI * 5.7) + 0.25 * Math.sin(sec * 2 * Math.PI * 8.3 + 1) * (lead === 'V1' || lead === 'II' || lead === 'III' || lead === 'aVF' ? 1.4 : 0.6);
    return f + qrst(sec - o.onsets[k], lead, sh, o.st[lead] || 0, !!o.tInv[lead], o.wide);
  }
  if (o.rhythm === 'chb') {
    const pp = 60 / o.atrialRate;
    return pWave(sec % pp, sh) + qrst((sec + 0.3) % rr - 0.3 + 0.0, lead, sh, 0, false, true);
  }
  const x = sec % rr;
  const pr = o.rhythm === 'paced' ? 0.15 : o.pr;
  let v = (o.rhythm === 'paced' ? 0 : pWave(x, sh)) + qrst(x - pr, lead, sh, o.st[lead] || 0, !!o.tInv[lead], o.wide);
  if (o.rhythm === 'paced' && x > 0.148 && x < 0.152) v += 9;     // the pacing spike
  return v;
}

export default function ECG12({ rate = 96, st = {}, tInv = {}, caption, height = 330, lbbb = false, rhythm = 'sinus', atrialRate = 80, shape = {}, pr = 0.15 }) {
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

      const opts = { rate, st, tInv, shape, rhythm, atrialRate, pr, wide: lbbb || rhythm === 'paced' };
      if (rhythm === 'af') {        // a fixed, seeded sequence of irregular R–R intervals averaging the given rate
        let seed = 7, t0 = 0.05; opts.onsets = [];
        const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        while (t0 < 11) { opts.onsets.push(t0); t0 += (60 / rate) * (0.55 + rnd() * 0.9); }
      }
      const rowH = h / 4;
      g.strokeStyle = '#1B1B1B'; g.lineWidth = 1.25; g.lineJoin = 'round';
      const trace = (lead, x0, x1, yc) => {
        g.beginPath();
        for (let px = x0; px <= x1; px += 0.6) {
          const sec = (px - x0) / mm / 25;
          const yy = yc - voltage(sec, lead, opts) * mm;
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
      g.fillText(`25 mm/s · 10 mm/mV · ${rhythm === 'chb' ? `A ${atrialRate} / V ${rate}` : `${rate} bpm`}`, w - 200, h - 6);
    };
    draw();
    const ro = new ResizeObserver(draw); ro.observe(c);
    return () => ro.disconnect();
  }, [rate, JSON.stringify(st), JSON.stringify(tInv), height, lbbb, rhythm, atrialRate, JSON.stringify(shape), pr]);

  return (
    <figure className="cs-fig" style={{ background: '#FFF6F4' }}>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height }} aria-label={caption || '12-lead ECG'} />
      {caption && <figcaption style={{ background: 'var(--panel)' }}>{caption}</figcaption>}
    </figure>
  );
}
