import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCase } from './CaseKit.jsx';

/* ============================================================
   ANGIOGRAPHY
   A coronary tree in 3D (patient frame: x = patient's left,
   y = cranial, z = anterior), projected through C-arm geometry.
   LAO/RAO rotates the detector about the long axis; cranial/
   caudal tilts it toward head or feet. Foreshortening, overlap
   and the spine sliding across the image all fall out of the
   projection — as on a real system.

   A cine run opacifies the injected system from the ostium out,
   holds, and washes out; every run costs contrast and dose.
   ============================================================ */

const deg = Math.PI / 180;
const VW = 0.19;   // projected vessel width per unit radius × scale

function basis(lao, cra) {
  const a = lao * deg, b = cra * deg;
  const viewer = [Math.sin(a) * Math.cos(b), Math.sin(b), Math.cos(a) * Math.cos(b)];
  const d = viewer.map(v => -v);
  const up = [-Math.sin(a) * Math.sin(b), Math.cos(b), -Math.cos(a) * Math.sin(b)];
  const right = [d[1] * up[2] - d[2] * up[1], d[2] * up[0] - d[0] * up[2], d[0] * up[1] - d[1] * up[0]];
  return { right, up, d };
}

/** Catmull–Rom through the control points, resampled by arc length. */
function sample(pts, n = 80) {
  const P = pts.map(p => p.slice());
  const raw = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < 16; k++) {
      const t = k / 16, t2 = t * t, t3 = t2 * t;
      raw.push([0, 1, 2].map(j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  raw.push(P[P.length - 1]);
  const len = [0];
  for (let i = 1; i < raw.length; i++) len.push(len[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1], raw[i][2] - raw[i - 1][2]));
  const L = len[len.length - 1];
  const out = [];
  let j = 0;
  for (let k = 0; k <= n; k++) {
    const target = L * k / n;
    while (j < len.length - 2 && len[j + 1] < target) j++;
    const f = (target - len[j]) / Math.max(1e-6, len[j + 1] - len[j]);
    out.push([0, 1, 2].map(q => raw[j][q] + (raw[j + 1][q] - raw[j][q]) * f));
  }
  return { pts: out, length: L };
}

/**
 * How narrow the lumen looks at t. An eccentric plaque (ecc, bulging along
 * dir) is seen in full only in profile: viewed en face, its shadow overlaps
 * the contrast column and the narrowing all but disappears.
 */
function narrowing(lesions, t, viewer) {
  let n = 0;
  for (const l of lesions || []) {
    if (t < l.t0 || t > l.t1) continue;
    const k = (t - l.t0) / (l.t1 - l.t0);
    const shape = l.shape ? l.shape(k) : Math.sin(k * Math.PI) ** 0.7;
    let seen = 1;
    if (l.ecc && l.dir && viewer) seen = 1 - l.ecc * Math.abs(l.dir[0] * viewer[0] + l.dir[1] * viewer[1] + l.dir[2] * viewer[2]);
    n = Math.max(n, l.sev * shape * seen);
  }
  return n;
}

export default function Angio({ tree, presets, system: sys0 = 'left', systems = ['left', 'right'], devices = {}, height = 400, onCine, caption, startView, autoCine = false }) {
  const { bump } = useCase() || {};
  const ref = useRef(null);
  const centre = useRef({ x: null, y: null, s: null });
  const [system, setSystem] = useState(sys0);
  const first = presets.find(p => p.system === sys0 && (!startView || p.id === startView)) || presets[0];
  const [view, setView] = useState({ lao: first.lao, cra: first.cra, id: first.id });
  const [labels, setLabels] = useState(false);
  const [cineAt, setCineAt] = useState(-1e9);
  const [hold, setHold] = useState(false);
  const S = useRef({});
  S.current = { view, system, labels, cineAt, hold, devices };

  const vessels = useMemo(() => tree.vessels.map(v => {
    const s = sample(v.pts, 90);
    return { ...v, s: s.pts, len: s.length };
  }), [tree]);
  const catheters = useMemo(() => ({
    left: sample(tree.catheter.left, 40).pts,
    right: sample(tree.catheter.right, 40).pts,
  }), [tree]);

  useEffect(() => {
    const c = ref.current;
    let raf;
    const grain = document.createElement('canvas');
    grain.width = 256; grain.height = 256;
    const gg = grain.getContext('2d');
    const grainFrame = () => {
      const img = gg.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 22; }
      gg.putImageData(img, 0, 0);
    };
    let frame = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth, h = height;
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const g = c.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { view: V, system: SY, labels: LB, cineAt: C0, hold: HOLD, devices: DV } = S.current;
      const B = basis(V.lao, V.cra);
      const t = now / 1000;
      const beat = Math.sin(t * 2 * Math.PI * 1.3);
      // centre and fit the injected system in the frame, easing as the C-arm moves
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (const v of vessels) {
        if (v.system !== SY) continue;
        for (let i = 0; i <= 90; i += 10) {
          const q = v.s[i];
          const x = q[0] * B.right[0] + q[1] * B.right[1] + q[2] * B.right[2];
          const y = q[0] * B.up[0] + q[1] * B.up[1] + q[2] * B.up[2];
          minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      }
      const C = centre.current;
      const fit = Math.min(h * 0.8 / Math.max(1, maxY - minY), w * 0.72 / Math.max(1, maxX - minX));
      const want = Math.max(h / 11, Math.min(h / 5.5, fit));
      C.s = C.s == null ? want : C.s + (want - C.s) * 0.12;
      const scale = C.s;
      const tx = w / 2 - (minX + maxX) / 2 * scale, ty = h / 2 + (minY + maxY) / 2 * scale;
      C.x = C.x == null ? tx : C.x + (tx - C.x) * 0.12;
      C.y = C.y == null ? ty : C.y + (ty - C.y) * 0.12;
      const cx = C.x, cy = C.y;
      const P = p => {
        const k = 1 + 0.018 * beat;
        const x = p[0] * k, y = p[1] * k + 0.04 * beat, z = p[2] * k;
        return [cx + (x * B.right[0] + y * B.right[1] + z * B.right[2]) * scale, cy - (x * B.up[0] + y * B.up[1] + z * B.up[2]) * scale];
      };

      // fluoroscopic background: exposure gradient, spine, diaphragm, ribs
      const bg = g.createRadialGradient(w * 0.5, h * 0.45, 30, w * 0.5, h * 0.5, w * 0.75);
      bg.addColorStop(0, '#C3C3C3'); bg.addColorStop(1, '#4A4A4A');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      const spine = P([0, -3, -6.5]);
      g.fillStyle = 'rgba(70,70,70,0.32)';
      g.fillRect(spine[0] - scale * 0.9, 0, scale * 1.8, h);
      for (let k = -2; k < 9; k++) { g.fillStyle = 'rgba(60,60,60,0.18)'; g.fillRect(spine[0] - scale, (k * 1.1 + 0.4) * scale + cy * 0.2, scale * 2, scale * 0.25); }
      g.strokeStyle = 'rgba(90,90,90,0.22)'; g.lineWidth = scale * 0.35;
      for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(spine[0], (k * 2.1 - 1) * scale + cy * 0.5, w * 0.45, scale * 1.2, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke(); }
      const dia = P([2, -7.6, 0]);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.beginPath(); g.ellipse(dia[0], dia[1] + scale * 2.2, w * 0.55, scale * 2.4, 0, Math.PI, 0); g.fill();

      // opacification
      const since = (t * 1000 - C0) / 1000;
      const running = since >= 0 && since < 4.2;
      const level = HOLD ? 1 : !running ? 0 : since < 0.35 ? 0 : 1;
      const front = HOLD ? 99 : Math.max(0, (since - 0.35) * 9);          // units of path length per second
      const fade = HOLD ? 1 : since < 2.9 ? 1 : Math.max(0, 1 - (since - 2.9) / 1.2);

      // calcium on plain fluoroscopy: parallel tram lines, visible before contrast
      for (const v of vessels) {
        for (const l of v.lesions || []) {
          if (!l.calcified) continue;
          g.strokeStyle = 'rgba(30,30,30,0.35)'; g.lineWidth = 1.2;
          for (const side of [-1, 1]) {
            g.beginPath();
            for (let i = Math.floor(l.t0 * 90); i <= Math.ceil(l.t1 * 90); i++) {
              const a = P(v.s[Math.max(0, i - 1)]), b = P(v.s[Math.min(90, i + 1)]);
              const nx = -(b[1] - a[1]), ny = b[0] - a[0], nn = Math.hypot(nx, ny) || 1;
              const p = P(v.s[i]);
              const off = side * (v.r0 || 0.3) * scale * VW * 1.15;
              const x = p[0] + nx / nn * off, y = p[1] + ny / nn * off;
              i === Math.floor(l.t0 * 90) ? g.moveTo(x, y) : g.lineTo(x, y);
            }
            g.stroke();
          }
        }
      }

      // the vessels (contrast is additive attenuation: overlaps look darker)
      if (level > 0) {
        for (const v of vessels) {
          if (v.system !== SY) continue;
          const startLen = v.offset || 0;
          const lesions = DV.lesions?.[v.id] ?? v.lesions;
          for (let i = 0; i < 90; i++) {
            const tt = i / 90;
            const dist = startLen + v.len * tt;
            if (dist > front) break;
            const a = P(v.s[i]), b = P(v.s[i + 1]);
            const n = narrowing(lesions, tt, [-B.d[0], -B.d[1], -B.d[2]]);
            const r = (v.r0 + (v.r1 - v.r0) * tt) * (1 - n);
            const edgeFill = Math.min(1, (front - dist) / 1.2);
            g.strokeStyle = `rgba(12,12,12,${0.82 * fade * edgeFill})`;
            g.lineWidth = Math.max(0.8, r * 2 * scale * VW);
            g.lineCap = 'round';
            g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
            if (n > 0.55 && v.hazy) {   // ragged, hazy edge of a ruptured plaque
              g.fillStyle = `rgba(20,20,20,${0.25 * fade})`;
              g.fillRect(a[0] + (Math.random() - 0.5) * 6, a[1] + (Math.random() - 0.5) * 6, 2, 2);
            }
          }
        }
        // perforation: contrast jet and a spreading pericardial stain
        const pf = DV.perforation;
        if (pf && pf.vessel && vessels.find(x => x.id === pf.vessel)?.system === SY) {
          const v = vessels.find(x => x.id === pf.vessel);
          const p = P(v.s[Math.round(pf.t * 90)]);
          const grow = Math.min(1, Math.max(0, since - 0.6) / 1.6) * fade;
          if (pf.sealed) {
            g.fillStyle = `rgba(40,40,40,${0.16 * fade})`;
            g.beginPath(); g.ellipse(p[0] + 26, p[1] + 10, 48, 24, 0.4, 0, Math.PI * 2); g.fill();
          } else if (grow > 0) {
            g.fillStyle = `rgba(15,15,15,${0.55 * grow})`;
            g.beginPath(); g.moveTo(p[0], p[1]);
            g.quadraticCurveTo(p[0] + 30, p[1] - 6, p[0] + 58 * grow, p[1] + 22 * grow);
            g.quadraticCurveTo(p[0] + 26, p[1] + 16, p[0], p[1]); g.fill();
            g.fillStyle = `rgba(30,30,30,${0.28 * grow})`;
            g.beginPath(); g.ellipse(p[0] + 60, p[1] + 34, 70 * grow, 34 * grow, 0.5, 0, Math.PI * 2); g.fill();
          }
        }
      }

      // dissection: a lucent flap while contrast is in, and a stain that hangs on after washout
      const ds = DV.dissection;
      const dv = ds && vessels.find(x => x.id === ds.vessel && x.system === SY);
      if (dv) {
        const hang = ds.sealed ? 0.12 : 0.5;
        for (let i = Math.floor(ds.t0 * 90); i < Math.ceil(ds.t1 * 90); i++) {
          const a = P(dv.s[i]), b = P(dv.s[i + 1]);
          g.strokeStyle = `rgba(28,28,28,${hang})`; g.lineCap = 'round';
          g.lineWidth = dv.r0 * 2 * scale * VW * 1.9;
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
          if (level > 0 && !ds.sealed) {
            const nx = -(b[1] - a[1]), ny = b[0] - a[0], nn = Math.hypot(nx, ny) || 1;
            const off = dv.r0 * scale * VW * 0.35 * Math.sin(i * 0.7);
            g.strokeStyle = `rgba(215,215,215,${0.75 * fade})`; g.lineWidth = 1.3;
            g.beginPath(); g.moveTo(a[0] + nx / nn * off, a[1] + ny / nn * off); g.lineTo(b[0] + nx / nn * off, b[1] + ny / nn * off); g.stroke();
          }
        }
        if (ds.aortic) {
          const cpts = catheters[SY];
          const o = P(cpts[0]);
          const up = P(cpts[Math.min(cpts.length - 1, 8)]);
          g.fillStyle = `rgba(30,30,30,${(ds.sealed ? 0.1 : 0.38) * ds.aortic})`;
          g.beginPath(); g.ellipse((o[0] + up[0]) / 2, (o[1] + up[1]) / 2, scale * 0.9 * ds.aortic + 6, Math.hypot(up[0] - o[0], up[1] - o[1]) / 2 + 6, Math.atan2(up[1] - o[1], up[0] - o[0]) + Math.PI / 2, 0, Math.PI * 2); g.fill();
        }
      }

      // catheter: always radio-opaque
      const cath = catheters[SY].map(P);
      g.strokeStyle = 'rgba(25,25,25,0.85)'; g.lineWidth = 3.2; g.lineCap = 'round';
      g.beginPath(); cath.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();

      // wires, balloons, stents
      const along = (vid, t0, t1, fn) => {
        const v = vessels.find(x => x.id === vid); if (!v) return;
        for (let i = Math.floor(t0 * 90); i < Math.ceil(t1 * 90); i++) fn(P(v.s[i]), P(v.s[i + 1]), v, i / 90);
      };
      for (const wre of DV.wires || []) {
        g.strokeStyle = 'rgba(20,20,20,0.9)'; g.lineWidth = 1.1;
        along(wre.vessel, 0, wre.to ?? 0.97, (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
        if (wre.from) along(wre.from, 0, wre.fromTo ?? 0.3, (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
      }
      for (const st of DV.stents || []) {
        along(st.vessel, st.t0, st.t1, (a, b, v, tt) => {
          const r = (st.d / 2) * scale * VW * 0.22;
          g.strokeStyle = st.covered ? 'rgba(25,25,25,0.6)' : `rgba(25,25,25,${(Math.round(tt * 90) % 2) ? 0.45 : 0.25})`;
          g.lineWidth = Math.max(1, r);
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
        });
      }
      const bl = DV.balloon;
      if (bl) {
        along(bl.vessel, bl.t0, bl.t1, (a, b) => {
          if (bl.inflated > 0) {
            g.strokeStyle = 'rgba(15,15,15,0.7)'; g.lineWidth = Math.max(2, bl.inflated * scale * VW * 0.22);
            g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
          }
        });
        const v = vessels.find(x => x.id === bl.vessel);
        for (const tt of [bl.t0, bl.t1]) {
          const p = P(v.s[Math.round(tt * 90)]);
          g.fillStyle = '#0C0C0C'; g.fillRect(p[0] - 3, p[1] - 3, 6, 6);           // radio-opaque markers
        }
      }

      if (LB && level > 0) {
        g.font = '600 11px Archivo, sans-serif'; g.fillStyle = '#FFE08A';
        for (const v of vessels) {
          if (v.system !== SY || !v.label) continue;
          const p = P(v.s[Math.round(v.labelAt * 90)]);
          g.strokeStyle = 'rgba(0,0,0,0.8)'; g.lineWidth = 3; g.strokeText(v.label, p[0] + 6, p[1] - 4);
          g.fillText(v.label, p[0] + 6, p[1] - 4);
        }
      }

      // grain, vignette, collimator
      if (frame++ % 3 === 0) grainFrame();
      g.globalAlpha = 0.9; g.drawImage(grain, 0, 0, w, h); g.globalAlpha = 1;
      const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.75)');
      g.fillStyle = vg; g.fillRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [vessels, catheters, height]);

  // open on a run already on the screen (the one that caused the trouble)
  useEffect(() => { if (autoCine) setCineAt(performance.now() - 300); }, []);   // eslint-disable-line

  const cine = () => {
    setHold(false);
    setCineAt(performance.now());
    bump?.({ contrast: system === 'left' ? 7 : 5, kerma: 14, dap: 3.1, fluoro: 4 });
    onCine?.(view, system);
  };
  const pick = p => { setView({ lao: p.lao, cra: p.cra, id: p.id }); setSystem(p.system); setHold(false); bump?.({ fluoro: 3, kerma: 1.5 }); };
  const name = (lao, cra) => `${lao >= 0 ? 'LAO' : 'RAO'} ${Math.abs(Math.round(lao))}° · ${cra >= 0 ? 'CRA' : 'CAU'} ${Math.abs(Math.round(cra))}°`;
  const preset = presets.find(p => p.id === view.id && p.lao === view.lao && p.cra === view.cra);

  return (
    <div className="cs-card tight">
      <div className="cs-viewer">
        <canvas ref={ref} className="cs-canvas" style={{ height }} aria-label={`Coronary angiogram, ${name(view.lao, view.cra)}`} />
        <div className="cs-viewer-hud">{name(view.lao, view.cra)}</div>
        <div className="cs-viewer-hud r">{system === 'left' ? 'LCA injection' : 'RCA injection'}<br />15 f/s · {devices.label || 'diagnostic'}</div>
        {preset && <div className="cs-viewer-hud b">{preset.name}</div>}
      </div>
      <div className="cs-ctrls">
        {presets.filter(p => systems.includes(p.system)).map(p => (
          <button key={p.id} className={'cs-chip' + (preset?.id === p.id ? ' on' : '')} onClick={() => pick(p)}>{p.short}</button>
        ))}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider">RAO
          <input type="range" min="-60" max="60" value={view.lao} onChange={e => setView(v => ({ ...v, lao: +e.target.value, id: null }))} aria-label="LAO/RAO angle" />
        LAO</label>
        <label className="cs-slider">CAU
          <input type="range" min="-40" max="40" value={view.cra} onChange={e => setView(v => ({ ...v, cra: +e.target.value, id: null }))} aria-label="Cranial/caudal angle" />
        CRA</label>
        <button className="cs-btn primary" onClick={cine}>● Cine / inject</button>
        <button className="cs-btn" onClick={() => setHold(h => !h)}>{hold ? 'Live' : 'Freeze best frame'}</button>
        <button className={'cs-chip' + (labels ? ' on' : '')} onClick={() => setLabels(l => !l)}>Labels</button>
      </div>
      {preset?.shows && <p className="cs-pts" style={{ marginTop: 8 }}><b style={{ color: 'var(--ink2)' }}>{preset.name}:</b> {preset.shows}</p>}
      {caption && <p className="cs-pts" style={{ marginTop: 4 }}>{caption}</p>}
    </div>
  );
}
