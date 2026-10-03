import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ============================================================
   IVUS — intravascular ultrasound pullback
   A cross-section at the transducer and the longitudinal
   (L-mode) view of the whole run. The vessel is described by a
   profile function: lumen and EEM radii, calcium arc, fractures,
   stent struts and side branches at every millimetre — so the
   same vessel can be re-imaged before preparation, after it,
   after stenting and after optimisation.
   ============================================================ */

const FOV = 7;    // mm across the cross-section, as on a coronary IVUS console

function rng(seed) {
  let s = (seed * 2654435761) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export default function IVUS({ profile, length = 60, marks = [], title, onFrame, proxLabel = 'proximal (LM)' }) {
  const xsRef = useRef(null);
  const lmRef = useRef(null);
  const [pos, setPos] = useState(marks[0]?.at ?? 20);
  const frame = profile(pos);

  // longitudinal view, drawn once per profile
  const lmode = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 600; c.height = 120;
    const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 600, 120);
    const r = rng(7);
    for (let x = 0; x < 600; x++) {
      const f = profile((1 - x / 600) * length);          // distal at the right, proximal at the left
      const s = 120 / FOV;
      const lum = f.lumenR * s, eem = f.eemR * s;
      for (let y = 0; y < 120; y += 1) {
        const d = Math.abs(y - 60);
        let b = 0;
        if (d < lum) b = 0.05 + r() * 0.08;
        else if (d < eem) b = 0.25 + r() * 0.35;
        else if (d < eem + 3) b = 0.08;
        else b = 0.12 + r() * 0.18;
        if (f.calc > 0 && d >= lum && d < lum + 3) b = 0.95;
        if (f.calc > 200 && d > lum + 3) b *= 0.08;            // shadow behind deep calcium
        if (f.stent && Math.abs(d - lum) < 1.2 && x % 6 < 2) b = 1;
        g.fillStyle = `rgba(255,255,255,${b})`; g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }, [profile, length]);

  useEffect(() => { onFrame?.(frame, pos); /* eslint-disable-next-line */ }, [pos]);

  // cross-section
  useEffect(() => {
    const c = xsRef.current;
    const size = Math.min(c.clientWidth, 340);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr; c.height = size * dpr;
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = size / 2, cy = size / 2, s = size / FOV;
    const f = frame;
    const r = rng(Math.round(pos * 5) + 1);
    g.fillStyle = '#000'; g.fillRect(0, 0, size, size);

    const inCalc = (a) => {
      if (!f.calc) return false;
      if (f.calc >= 360) return !(f.fractures || []).some(fa => angDist(a, fa) < 0.12);
      const start = f.calcStart ?? 0.3;
      return angDist(a, start + (f.calc * Math.PI / 180) / 2) < (f.calc * Math.PI / 180) / 2;
    };
    // speckle, polar
    for (let i = 0; i < 9000; i++) {
      const a = r() * Math.PI * 2;
      const rad = r() * FOV / 2;
      const lumR = lumenAt(f, a);
      let b;
      if (rad < 0.55) continue;                                       // catheter
      if (rad < lumR) b = 0.04 + r() * 0.1;                           // blood
      else if (rad < f.eemR - 0.12) b = 0.22 + r() * 0.42;            // plaque
      else if (rad < f.eemR + 0.05) b = 0.04;                         // media: thin dark band
      else b = 0.12 + r() * 0.28;                                     // adventitia
      if (inCalc(a) && rad > lumR + 0.2) b *= 0.06;                   // acoustic shadow
      if (f.flap && angDist(a, f.flap.at) < f.flap.arc / 2 && rad > lumR + 0.06 && rad < lumR + f.flap.depth) b = 0.03 + r() * 0.06;   // false lumen
      g.fillStyle = `rgba(255,255,255,${b})`;
      g.fillRect(cx + Math.cos(a) * rad * s, cy + Math.sin(a) * rad * s, 1.6, 1.6);
    }
    // calcium: bright leading edge, reverberations behind
    if (f.calc) {
      for (let k = 0; k < 360; k++) {
        const a = k * Math.PI / 180;
        if (!inCalc(a)) continue;
        const lr = lumenAt(f, a);
        g.fillStyle = 'rgba(255,255,255,0.95)';
        g.fillRect(cx + Math.cos(a) * (lr + 0.08) * s - 1.5, cy + Math.sin(a) * (lr + 0.08) * s - 1.5, 3, 3);
        if (k % 2 === 0) {
          g.fillStyle = 'rgba(255,255,255,0.28)';
          g.fillRect(cx + Math.cos(a) * (lr + 0.55) * s - 1, cy + Math.sin(a) * (lr + 0.55) * s - 1, 2, 2);
          g.fillStyle = 'rgba(255,255,255,0.14)';
          g.fillRect(cx + Math.cos(a) * (lr + 1.0) * s - 1, cy + Math.sin(a) * (lr + 1.0) * s - 1, 2, 2);
        }
      }
    }
    // dissection flap: a bright membrane between the true lumen and the false one
    if (f.flap) {
      g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 2.2; g.beginPath();
      for (let k = 0; k <= 40; k++) {
        const a = f.flap.at - f.flap.arc / 2 + f.flap.arc * k / 40;
        const rr = (lumenAt(f, a) + 0.05) * s;
        k ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      g.stroke();
    }
    // stent struts
    if (f.stent) {
      for (let k = 0; k < 14; k++) {
        const a = k / 14 * Math.PI * 2 + 0.2;
        const lr = lumenAt(f, a);
        g.fillStyle = '#FFFFFF';
        g.beginPath(); g.arc(cx + Math.cos(a) * lr * s, cy + Math.sin(a) * lr * s, 2.6, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.9)'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * (lr + 0.15) * s, cy + Math.sin(a) * (lr + 0.15) * s); g.lineTo(cx + Math.cos(a) * (lr + 0.6) * s, cy + Math.sin(a) * (lr + 0.6) * s); g.stroke();
      }
    }
    // catheter, ring-down, guidewire artefact
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy, 0.45 * s, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(cx, cy, 0.6 * s, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#FFF'; g.beginPath(); g.arc(cx + 0.7 * s, cy - 0.5 * s, 2.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.95)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 0.7 * s, cy - 0.5 * s); g.lineTo(cx + 4.8 * s, cy - 3.4 * s); g.stroke();
    // lumen and EEM traces, as the analyst draws them
    g.setLineDash([4, 3]); g.lineWidth = 1.4;
    g.strokeStyle = '#3ED0F5'; g.beginPath();
    for (let k = 0; k <= 72; k++) { const a = k / 72 * Math.PI * 2; const lr = lumenAt(f, a); k ? g.lineTo(cx + Math.cos(a) * lr * s, cy + Math.sin(a) * lr * s) : g.moveTo(cx + Math.cos(a) * lr * s, cy + Math.sin(a) * lr * s); }
    g.stroke();
    if (!(f.calc >= 300)) {   // EEM cannot be traced behind a full ring of calcium
      g.strokeStyle = '#F2D24B'; g.beginPath(); g.arc(cx, cy, f.eemR * s, 0, Math.PI * 2); g.stroke();
    }
    g.setLineDash([]);
    // scale bar
    g.fillStyle = '#9FB4C6'; g.fillRect(size - 12 - s, size - 14, s, 2);
    g.font = '600 10px "IBM Plex Mono", monospace'; g.fillText('1 mm', size - 12 - s, size - 18);
  }, [pos, profile]);

  const area = r => Math.PI * r * r;
  const la = f => (f.lumenArea ?? area(f.lumenR));
  const ea = area(frame.eemR);
  const lumen = la(frame);
  const pb = Math.max(0, (1 - lumen / ea) * 100);
  const refMark = marks.find(m => m.ref);
  const refLumen = refMark ? la(profile(refMark.at)) : null;

  return (
    <div className="cs-card tight">
      {title && <div className="cs-pts" style={{ marginBottom: 8 }}>{title}</div>}
      <div className="cs-grid2" style={{ alignItems: 'start' }}>
        <div className="cs-viewer" style={{ maxWidth: 340, aspectRatio: '1 / 1' }}>
          <canvas ref={xsRef} style={{ width: '100%', height: '100%', display: 'block' }} aria-label={`IVUS cross-section at ${pos.toFixed(1)} millimetres`} />
          <div className="cs-viewer-hud">60 MHz · {pos.toFixed(1)} mm</div>
          <div className="cs-viewer-hud b"><span style={{ color: '#3ED0F5' }}>— lumen</span>{!(frame.calc >= 300) && <> · <span style={{ color: '#F2D24B' }}>— EEM</span></>}</div>
        </div>
        <div>
          <div className="cs-readout" style={{ marginTop: 0 }}>
            <div><span>{frame.stent ? 'Stent area' : 'Lumen area'}</span><b>{lumen.toFixed(1)} mm²</b></div>
            <div><span>Lumen Ø</span><b>{(2 * Math.sqrt(lumen / Math.PI)).toFixed(2)} mm</b></div>
            <div><span>EEM area</span><b>{frame.calc >= 300 ? '—' : `${ea.toFixed(1)} mm²`}</b></div>
            <div><span>EEM Ø</span><b>{frame.calc >= 300 ? 'shadowed' : `${(2 * frame.eemR).toFixed(2)} mm`}</b></div>
            <div><span>Plaque burden</span><b>{frame.calc >= 300 ? '—' : `${pb.toFixed(0)}%`}</b></div>
            <div><span>Calcium arc</span><b>{frame.calc ? `${frame.calc}°` : '0°'}</b></div>
            {frame.stent && refLumen && <div><span>Expansion vs distal ref</span><b style={{ color: lumen / refLumen < 0.8 ? 'var(--red)' : lumen / refLumen < 0.9 ? 'var(--amber)' : 'var(--green)' }}>{Math.round(lumen / refLumen * 100)}%</b></div>}
          </div>
          {frame.note && <p className="cs-pts" style={{ marginTop: 8, color: 'var(--amber)' }}>{frame.note}</p>}
        </div>
      </div>
      <div style={{ position: 'relative', marginTop: 12 }}>
        <canvas
          ref={el => { lmRef.current = el; if (el) { const g = el.getContext('2d'); el.width = 600; el.height = 120; g.drawImage(lmode, 0, 0); const x = (1 - pos / length) * 600; g.strokeStyle = '#FFB020'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 120); g.stroke(); } }}
          style={{ width: '100%', height: 90, display: 'block', borderRadius: 8, cursor: 'ew-resize' }}
          onPointerDown={e => { const r = e.currentTarget.getBoundingClientRect(); setPos((1 - (e.clientX - r.left) / r.width) * length); }}
          onPointerMove={e => { if (e.buttons !== 1) return; const r = e.currentTarget.getBoundingClientRect(); setPos(Math.max(0, Math.min(length, (1 - (e.clientX - r.left) / r.width) * length))); }}
          aria-label="Longitudinal view — drag to move the transducer"
        />
        <div className="cs-row" style={{ justifyContent: 'space-between', fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>
          <span>{proxLabel}</span><span>drag along the run to move the transducer</span><span>distal</span>
        </div>
      </div>
      <div className="cs-ctrls">
        <input type="range" min="0" max={length} step="0.2" value={pos} onChange={e => setPos(+e.target.value)} style={{ flex: 1, accentColor: 'var(--accent)' }} aria-label="Pullback position (mm)" />
        {marks.map(m => (
          <button key={m.label} className={'cs-chip' + (Math.abs(pos - m.at) < 0.3 ? ' on' : '')} onClick={() => setPos(m.at)}>{m.label}</button>
        ))}
      </div>
    </div>
  );
}

function angDist(a, b) {
  const d = Math.abs(((a - b) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
  return d;
}
/** Lumen radius at an angle: round, slightly eccentric, with a side-branch bulge. */
function lumenAt(f, a) {
  let r = f.lumenR * (1 + (f.ecc || 0) * Math.cos(a - (f.eccAt || 0)));
  if (f.branch) r += f.branch * Math.max(0, Math.cos(a + 0.9)) ** 6;
  return r;
}
