/* ============================================================
   CATH LAB · CASE 03 — PROJECTION ENGINE
   The C-arm as geometry. A point in the patient is projected
   along the X-ray beam onto the detector, with the beam's
   divergence (objects nearer the tube are magnified more).
   Everything the case teaches — foreshortening, overlap, the
   spine sliding left and right, the diaphragm rising in cranial
   views — falls out of this projection rather than being drawn.

   Two renderers share it: `drawAngio` paints the image as the
   lab monitor shows it (contrast black on grey), and
   `drawDiagram` paints the same projection as a labelled,
   colour-coded teaching diagram.
   ============================================================ */

import { TREE, LESIONS, SEGMENTS } from './anatomy.js';

const deg = Math.PI / 180;
const SOD = 72;          // source → isocentre (cm)
const N = 90;            // samples per vessel

/** Viewer (toward the detector), screen up and screen right for a C-arm angle. */
export function basis(lao, cra) {
  const a = lao * deg, b = cra * deg;
  const viewer = [Math.sin(a) * Math.cos(b), Math.sin(b), Math.cos(a) * Math.cos(b)];
  const d = viewer.map(v => -v);
  const up = [-Math.sin(a) * Math.sin(b), Math.cos(b), -Math.cos(a) * Math.sin(b)];
  const right = [d[1] * up[2] - d[2] * up[1], d[2] * up[0] - d[0] * up[2], d[0] * up[1] - d[1] * up[0]];
  return { viewer, up, right };
}

const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];

/** Catmull–Rom through the control points, resampled by arc length. */
export function sample(pts, n = N) {
  const raw = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 16; k++) {
      const t = k / 16, t2 = t * t, t3 = t2 * t;
      raw.push([0, 1, 2].map(j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  raw.push(pts[pts.length - 1]);
  const len = [0];
  for (let i = 1; i < raw.length; i++) len.push(len[i - 1] + Math.hypot(...sub(raw[i], raw[i - 1])));
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

export const VESSELS = TREE.vessels.map(v => {
  const s = sample(v.pts);
  return { ...v, s: s.pts, len: s.length };
});
export const VESSEL = Object.fromEntries(VESSELS.map(v => [v.id, v]));
const CATH = { left: sample(TREE.catheter.left, 40).pts, right: sample(TREE.catheter.right, 40).pts };
const ISO = TREE.iso;

/* ---------- the rest of the tree: hundreds of small branches ----------
   Grown once, deterministically, from the named vessels: twigs that hug the
   heart's surface (diagonal, marginal, RV and apical branches) and septal
   perforators that dive into the septum. They fill with contrast with their
   parent and make the projection look like a real injection. */
const norm3 = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const cross3 = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
export const TWIGS = (() => {
  let seed = 20240611;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const C = TREE.heart.centre;
  const out = [];
  const grow = (start, dir, len, r0, system, offset, depth, septal, color) => {
    const pts = [start];
    let p = start, d = dir;
    const steps = 9;
    for (let k = 0; k < steps; k++) {
      const n = norm3(sub(p, C));
      d = norm3([d[0] + (rnd() - 0.5) * 0.26, d[1] + (rnd() - 0.5) * 0.26, d[2] + (rnd() - 0.5) * 0.26]);
      if (!septal) { const dn = dot(d, n); d = norm3([d[0] - n[0] * dn * 0.85, d[1] - n[1] * dn * 0.85, d[2] - n[2] * dn * 0.85]); }
      p = [p[0] + d[0] * len / steps, p[1] + d[1] * len / steps, p[2] + d[2] * len / steps];
      pts.push(p);
    }
    out.push({ pts, r0, r1: Math.max(0.03, r0 * 0.35), system, offset, color });
    if (depth > 0) {
      const k = 3 + Math.floor(rnd() * 4);
      const tn = norm3(sub(pts[k + 1], pts[k - 1]));
      const n = norm3(sub(pts[k], C));
      const side = norm3(cross3(n, tn));
      const sg = rnd() < 0.5 ? -1 : 1;
      const cd = septal ? norm3([tn[0] - n[0] * 0.5, tn[1] - n[1] * 0.5, tn[2] - n[2] * 0.5]) : norm3([tn[0] * 0.6 + side[0] * sg * 0.8, tn[1] * 0.6 + side[1] * sg * 0.8, tn[2] * 0.6 + side[2] * sg * 0.8]);
      grow(pts[k], cd, len * 0.55, r0 * 0.6, system, offset + len * k / 9, depth - 1, septal, color);
    }
  };
  for (const v of VESSELS) {
    if (['LM', 'S1', 'S2', 'CB'].includes(v.id)) continue;
    const big = v.r0 >= 0.3;
    let i = 6;
    while (i < N - 4) {
      const p = v.s[i], tn = norm3(sub(v.s[i + 1], v.s[i - 1])), n = norm3(sub(p, C));
      const side = norm3(cross3(n, tn));
      const rp = v.r0 + (v.r1 - v.r0) * (i / N);
      const sg = rnd() < 0.5 ? -1 : 1, a = (35 + rnd() * 35) * Math.PI / 180;
      const d = norm3([tn[0] * Math.cos(a) + side[0] * Math.sin(a) * sg, tn[1] * Math.cos(a) + side[1] * Math.sin(a) * sg, tn[2] * Math.cos(a) + side[2] * Math.sin(a) * sg]);
      grow(p, d, (big ? 1.4 : 0.9) + rnd() * (big ? 1.8 : 1.0), Math.max(0.05, rp * (0.32 + rnd() * 0.2)), v.system, (v.offset || 0) + v.len * i / N, big ? 1 : 0, false, v.color);
      // septal perforators off the LAD, diving into the septum
      if (v.id === 'LAD' && i < N * 0.7 && rnd() < 0.55) grow(p, norm3([tn[0] * 0.35 - n[0], tn[1] * 0.35 - n[1], tn[2] * 0.35 - n[2]]), 1.2 + rnd() * 1.4, 0.07, 'left', (v.offset || 0) + v.len * i / N, 1, true, '#A78BFA');
      i += big ? 4 + Math.floor(rnd() * 4) : 7 + Math.floor(rnd() * 5);
    }
  }
  return out;
})();

/** Cardiac motion: systolic shortening toward the base and a small twist about the long axis. */
const AX = (() => { const a = sub(TREE.heart.apex, TREE.heart.centre); const l = Math.hypot(...a); return a.map(v => v / l); })();
function moveHeart(p, s) {
  const C = TREE.heart.centre;
  const d = sub(p, C);
  const along = dot(d, AX);
  const tw = s * 0.07 * (along / 5);                       // radians, apex twists more
  const c = Math.cos(tw), sn = Math.sin(tw);
  const kv = cross3(AX, d), kd = along;
  const r = [0, 1, 2].map(i => d[i] * c + kv[i] * sn + AX[i] * kd * (1 - c));
  const k = 1 - 0.045 * s;
  return [C[0] + r[0] * k - AX[0] * along * 0.03 * s, C[1] + r[1] * k - AX[1] * along * 0.03 * s, C[2] + r[2] * k - AX[2] * along * 0.03 * s];
}

/** Heart surface points, for the cardiac silhouette. */
const HEART_PTS = (() => {
  const { centre, apex, radii } = TREE.heart;
  const ax = sub(apex, centre); const L = Math.hypot(...ax); const a = ax.map(v => v / L);
  const t1 = [a[1], -a[0], 0]; const n1 = Math.hypot(...t1); const u = t1.map(v => v / n1);
  const w = [a[1] * u[2] - a[2] * u[1], a[2] * u[0] - a[0] * u[2], a[0] * u[1] - a[1] * u[0]];
  const pts = [];
  for (let i = 0; i <= 10; i++) for (let j = 0; j < 16; j++) {
    const th = i / 10 * Math.PI, ph = j / 16 * Math.PI * 2;
    const ca = Math.cos(th) * radii[0], cb = Math.sin(th) * Math.cos(ph) * radii[1], cc = Math.sin(th) * Math.sin(ph) * radii[2];
    pts.push([0, 1, 2].map(q => centre[q] + a[q] * ca + u[q] * cb + w[q] * cc));
  }
  return pts;
})();

/** Diaphragm dome (right side higher, over the liver). */
const DOME = (() => {
  const pts = [];
  for (let x = -13; x <= 14; x += 0.5) for (let z = -10; z <= 7; z += 0.5) {
    pts.push([x, -8.4 - 0.032 * (x - 1.5) ** 2 - 0.03 * (z + 1) ** 2 + (x < 0 ? 0.9 : 0), z]);
  }
  return pts;
})();

/** A projector for a view: patient point → screen pixel. */
export function projector(lao, cra, w, h, zoom = 1) {
  const B = basis(lao, cra);
  const scale = Math.min(w, h) / 11 * zoom;
  const cx = w / 2, cy = h / 2;
  const P = p => {
    const q = sub(p, ISO);
    const k = SOD / (SOD + dot(q, B.viewer));
    return [cx + dot(q, B.right) * k * scale, cy - dot(q, B.up) * k * scale];
  };
  return { B, P, scale };
}

/** How narrow the lumen looks at t (eccentric plaque only in profile). */
export function narrowing(lesions, t, viewer) {
  let n = 0;
  for (const l of lesions || []) {
    if (t < l.t0 || t > l.t1) continue;
    const k = (t - l.t0) / (l.t1 - l.t0);
    const shape = l.shape ? l.shape(k) : Math.sin(k * Math.PI) ** 0.7;
    let seen = 1;
    if (l.ecc && l.dir) {
      const dn = Math.hypot(...l.dir);
      seen = 1 - l.ecc * Math.abs(dot(l.dir, viewer) / dn);
    }
    n = Math.max(n, l.sev * shape * seen);
  }
  return n;
}

/* ---------- metrics: foreshortening and overlap ---------- */

/**
 * For a segment in a view: the projected length as a fraction of its true
 * length (1 = seen in full, low = foreshortened), and the fraction of it
 * lying over another vessel of the same injection.
 */
export function segmentMetrics(lao, cra, seg) {
  const B = basis(lao, cra);
  const v = VESSEL[seg.vessel];
  const i0 = Math.round(seg.t0 * N), i1 = Math.round(seg.t1 * N);
  const pr = p => { const q = sub(p, ISO); return [dot(q, B.right), dot(q, B.up)]; };
  let L3 = 0, L2 = 0;
  for (let i = i0; i < i1; i++) {
    L3 += Math.hypot(...sub(v.s[i + 1], v.s[i]));
    const a = pr(v.s[i]), b = pr(v.s[i + 1]);
    L2 += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  let over = 0, n = 0;
  for (let i = i0; i <= i1; i += 2) {
    n++;
    const p = v.s[i], pp = pr(p);
    const r = v.r0 + (v.r1 - v.r0) * (i / N);
    let hit = false;
    for (const o of VESSELS) {
      if (o.id === v.id || o.system !== v.system) continue;
      for (let j = 0; j <= N && !hit; j += 2) {
        const q = o.s[j];
        if (Math.hypot(...sub(q, p)) < 2.4) continue;          // the branch point itself
        const qq = pr(q);
        const ro = o.r0 + (o.r1 - o.r0) * (j / N);
        if (Math.hypot(qq[0] - pp[0], qq[1] - pp[1]) < (r + ro) * 0.55 + 0.08) hit = true;
      }
      if (hit) break;
    }
    if (hit) over++;
  }
  return { fs: L3 ? L2 / L3 : 1, overlap: n ? over / n : 0 };
}

/** A segment is "seen well" in a view when it is long and clear. */
export const seenWell = m => m.fs >= 0.72 && m.overlap <= 0.3;

/** How tight a vessel's worst lesion LOOKS in this view (0–1): eccentric plaque hides en face. */
export function lesionLook(lao, cra, vesselId) {
  const B = basis(lao, cra);
  let worst = 0;
  for (const l of LESIONS[vesselId] || []) for (let k = 0; k <= 12; k++) worst = Math.max(worst, narrowing([l], l.t0 + (l.t1 - l.t0) * k / 12, B.viewer));
  return worst;
}

/** Coverage of all segments of a system from a list of acquired views. */
export function coverage(views, system) {
  const out = {};
  for (const seg of SEGMENTS) {
    if (VESSEL[seg.vessel].system !== system) continue;
    out[seg.id] = views.filter(v => v.system === system && seenWell(segmentMetrics(v.lao, v.cra, seg))).length;
  }
  return out;
}

/* ---------- shared background pieces ---------- */

function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

function domeEnvelope(P, w, h) {
  const bins = 48, top = new Array(bins).fill(Infinity);
  for (const p of DOME) {
    const s = P(p);
    const b = Math.floor(s[0] / w * bins);
    if (b >= 0 && b < bins) top[b] = Math.min(top[b], s[1]);
  }
  // fill gaps from neighbours, then smooth
  for (let i = 0; i < bins; i++) if (!isFinite(top[i])) top[i] = h * 1.2;
  let sm = top;
  for (let pass = 0; pass < 3; pass++) sm = sm.map((_, i) => (sm[Math.max(0, i - 2)] + sm[Math.max(0, i - 1)] + sm[i] * 2 + sm[Math.min(bins - 1, i + 1)] + sm[Math.min(bins - 1, i + 2)]) / 6);
  return sm.map((y, i) => [(i + 0.5) / bins * w, y]);
}

function spineLine(P) {
  const { x, z } = TREE.spine;
  return [P([x, -16, z]), P([x, 12, z])];
}

let GRAIN = null, MOTTLE = null;
function grainCanvas() {
  if (GRAIN) return GRAIN;
  GRAIN = document.createElement('canvas');
  GRAIN.width = GRAIN.height = 256;
  const gg = GRAIN.getContext('2d');
  const img = gg.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 20; }
  gg.putImageData(img, 0, 0);
  return GRAIN;
}
/** Low-frequency lung mottle: soft blotches, scaled up with smoothing. */
function mottleCanvas() {
  if (MOTTLE) return MOTTLE;
  MOTTLE = document.createElement('canvas');
  MOTTLE.width = MOTTLE.height = 110;
  const gg = MOTTLE.getContext('2d');
  const img = gg.createImageData(110, 110);
  let sd = 99;
  for (let i = 0; i < img.data.length; i += 4) { sd = (sd * 16807) % 2147483647; const v = 150 + (sd / 2147483647) * 105; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  gg.putImageData(img, 0, 0);
  return MOTTLE;
}

// one off-screen layer per output size for the contrast (multiplied onto the chest)
const LAYERS = new Map();
function layer(w, h) {
  const k = `${w}x${h}`;
  let c = LAYERS.get(k);
  if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; LAYERS.set(k, c); if (LAYERS.size > 8) LAYERS.delete(LAYERS.keys().next().value); }
  return c;
}
// cache of whole frames: the image only changes 15 times a second (cine frame rate)
const FRAMES = new Map();

/** Ribs as 3D arcs from the spine round to the sternum, sloping down anteriorly. */
const RIBS = (() => {
  const out = [];
  for (let i = 0; i < 10; i++) {
    const y0 = 9 - i * 2.7;
    for (const side of [-1, 1]) {
      const pts = [];
      for (let k = 0; k <= 24; k++) {
        const th = k / 24 * Math.PI * 0.92;
        pts.push([side * (1.6 + 13.5 * Math.sin(th)), y0 - 4.2 * (1 - Math.cos(th)) / 2, -8.5 + 7.2 * (1 - Math.cos(th))]);
      }
      out.push(pts);
    }
  }
  return out;
})();

/* ---------- 1 · the angiogram as the lab monitor shows it ---------- */

const NAMES = { LM: 'Left Main', LAD: 'Left Anterior Descending', D1: 'First Diagonal', D2: 'Second Diagonal', S1: 'Septal perforator', LCx: 'Left Circumflex', OM1: 'Obtuse Marginal 1', OM2: 'Obtuse Marginal 2', RCA: 'Right Coronary Artery', CB: 'Conus branch', AM: 'Acute Marginal', PDA: 'Posterior Descending', PLV: 'Posterolateral branch' };

/**
 * state: { lao, cra, system, t (s), fill (0–1), fade (0–1), blush (0–1), labels, title, lesions }
 */
export function drawAngio(g, w, h, state) {
  const { lao, cra, system = 'left', t = 0, fill = 1, fade = 1, blush = 0, labels = false, title = null, lesions = LESIONS } = state;
  const frame = Math.floor(t * 15);                                     // 15 frames/s cine
  const key = [w, h, Math.round(lao), Math.round(cra), system, frame, fill.toFixed(2), fade.toFixed(2), blush.toFixed(2), labels, title].join('|');
  const id = `${w}x${h}`;
  const cached = FRAMES.get(id);
  if (cached && cached.key === key) { g.drawImage(cached.c, 0, 0, w, h); return; }

  const out = cached?.c || document.createElement('canvas');
  if (out.width !== w || out.height !== h) { out.width = w; out.height = h; }
  const o = out.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.globalCompositeOperation = 'source-over'; o.filter = 'none';

  const tf = frame / 15;
  const s = 0.5 + 0.5 * Math.sin(tf * 2 * Math.PI * 1.2);                // systolic phase
  const { B, P: P0, scale } = projector(lao, cra, w, h);
  const P = p => P0(moveHeart(p, s));
  const Pb = P0;                                                        // bones and catheter do not beat

  // 1 · exposure: bright lung fields, darker mediastinum and edges
  const bg = o.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
  bg.addColorStop(0, '#D8D8D8'); bg.addColorStop(0.65, '#B6B6B6'); bg.addColorStop(1, '#727272');
  o.fillStyle = bg; o.fillRect(0, 0, w, h);
  o.globalCompositeOperation = 'multiply';
  o.imageSmoothingEnabled = true;
  o.globalAlpha = 0.28; o.drawImage(mottleCanvas(), -w * 0.1, -h * 0.1, w * 1.2, h * 1.2);
  o.globalAlpha = 0.18; o.drawImage(mottleCanvas(), -w * 0.7, -h * 0.6, w * 2.4, h * 2.2); o.globalAlpha = 1;

  // 2 · ribs: faint, soft-edged bands (bone attenuates a little more than lung)
  o.lineCap = 'round';
  o.filter = `blur(${Math.max(2, scale * 0.25)}px)`;
  for (const rib of RIBS) {
    const pr = rib.map(Pb);
    o.strokeStyle = 'rgba(0,0,0,0.07)'; o.lineWidth = 1.3 * scale;
    o.beginPath(); pr.forEach((q, i) => (i ? o.lineTo(q[0], q[1]) : o.moveTo(q[0], q[1]))); o.stroke();
  }

  // 3 · spine: vertebral bodies with lucent disc spaces, pedicles faintly
  const { x: sx, z: sz } = TREE.spine;
  for (let y = -17; y <= 13; y += 2.6) {
    const c0 = Pb([sx, y, sz]), c1 = Pb([sx, y + 1, sz]);
    const ang = Math.atan2(c1[1] - c0[1], c1[0] - c0[0]) + Math.PI / 2;
    o.save(); o.translate(c0[0], c0[1]); o.rotate(ang);
    o.fillStyle = 'rgba(0,0,0,0.17)';
    o.beginPath(); o.roundRect(-1.75 * scale, -1.0 * scale, 3.5 * scale, 2.05 * scale, 0.6 * scale); o.fill();
    o.fillStyle = 'rgba(0,0,0,0.09)';
    for (const sd of [-1, 1]) { o.beginPath(); o.ellipse(sd * 1.15 * scale, -0.2 * scale, 0.42 * scale, 0.6 * scale, 0, 0, Math.PI * 2); o.fill(); }
    o.restore();
  }
  o.filter = 'none';

  // 4 · cardiac silhouette (soft edge) and diaphragm / liver
  const hl = hull(HEART_PTS.map(P));
  o.filter = `blur(${Math.max(2, scale * 0.35)}px)`;
  o.fillStyle = 'rgba(0,0,0,0.16)';
  o.beginPath(); hl.forEach((q, i) => (i ? o.lineTo(q[0], q[1]) : o.moveTo(q[0], q[1]))); o.closePath(); o.fill();
  const env = domeEnvelope(Pb, w, h);
  o.fillStyle = 'rgba(0,0,0,0.34)';
  o.beginPath(); o.moveTo(0, h + 20); env.forEach(q => o.lineTo(q[0], q[1])); o.lineTo(w, h + 20); o.closePath(); o.fill();
  o.filter = 'none';

  // 5 · contrast: density layer, multiplied onto the chest (Beer–Lambert: crossings get darker)
  if (fill > 0 || blush > 0) {
    const L = layer(w, h), lg = L.getContext('2d');
    lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over';
    lg.fillStyle = '#FFF'; lg.fillRect(0, 0, w, h);
    lg.lineCap = 'round'; lg.lineJoin = 'round';
    const front = fill * 26;
    const stroke = (a, b, r, dens) => {
      const wd = Math.max(1, r * 2 * scale * 0.42);
      lg.beginPath(); lg.moveTo(a[0], a[1]); lg.lineTo(b[0], b[1]);
      lg.strokeStyle = `rgba(0,0,0,${dens * 0.42})`; lg.lineWidth = wd; lg.stroke();
      if (wd > 2.2) {
        lg.strokeStyle = `rgba(0,0,0,${dens * 0.38})`; lg.lineWidth = wd * 0.62; lg.stroke();
        lg.strokeStyle = `rgba(0,0,0,${dens * 0.32})`; lg.lineWidth = wd * 0.3; lg.stroke();
      }
    };
    if (fill > 0) {
      for (const v of VESSELS) {
        if (v.system !== system) continue;
        const ls = lesions[v.id];
        let prev = P(v.s[0]);
        for (let i = 0; i < N; i++) {
          const tt = i / N, dist = (v.offset || 0) + v.len * tt;
          if (dist > front) break;
          const b = P(v.s[i + 1]);
          const n = narrowing(ls, tt, B.viewer);
          const r = (v.r0 + (v.r1 - v.r0) * tt) * (1 - n);
          const dens = Math.min(0.82, 0.42 + r * 0.95) * fade * Math.min(1, (front - dist) / 1.2);
          stroke(prev, b, r, dens);
          prev = b;
        }
      }
      for (const tw of TWIGS) {
        if (tw.system !== system) continue;
        let prev = P(tw.pts[0]);
        const len = tw.pts.length - 1;
        for (let i = 0; i < len; i++) {
          const dist = tw.offset + i * 0.25;
          if (dist > front) break;
          const b = P(tw.pts[i + 1]);
          const r = tw.r0 + (tw.r1 - tw.r0) * (i / len);
          stroke(prev, b, r, Math.min(0.7, 0.36 + r * 1.2) * fade * Math.min(1, (front - dist) / 1.2));
          prev = b;
        }
      }
    }
    if (blush > 0) {                                                    // myocardial blush after washout
      lg.filter = `blur(${scale * 1.2}px)`;
      lg.fillStyle = `rgba(0,0,0,${0.10 * blush})`;
      lg.beginPath(); hl.forEach((q, i) => (i ? lg.lineTo(q[0], q[1]) : lg.moveTo(q[0], q[1]))); lg.closePath(); lg.fill();
      lg.filter = 'none';
    }
    o.filter = 'blur(0.45px)';
    o.drawImage(L, 0, 0);
    o.filter = 'none';
  }

  // 6 · catheter: dense walls, a slightly lighter lumen
  const cath = CATH[system].map(P);
  o.globalCompositeOperation = 'source-over';
  o.strokeStyle = 'rgba(18,18,18,0.88)'; o.lineWidth = Math.max(2.4, scale * 0.17); o.lineCap = 'round';
  o.beginPath(); cath.forEach((q, i) => (i ? o.lineTo(q[0], q[1]) : o.moveTo(q[0], q[1]))); o.stroke();
  o.strokeStyle = 'rgba(70,70,70,0.7)'; o.lineWidth = Math.max(0.8, scale * 0.05);
  o.beginPath(); cath.forEach((q, i) => (i ? o.lineTo(q[0], q[1]) : o.moveTo(q[0], q[1]))); o.stroke();

  // 7 · film grain and vignette
  o.drawImage(grainCanvas(), -(frame * 37 % 64), -(frame * 53 % 64), w + 64, h + 64);
  const vg = o.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  o.fillStyle = vg; o.fillRect(0, 0, w, h);

  // 8 · teaching overlays
  if (labels && fill > 0.6) drawCallouts(o, w, h, P, system, scale);
  if (labels && title) drawTitle(o, w, h, title, system);
  if (w >= 300) drawInset(o, w, h, lao, cra);

  FRAMES.set(id, { key, c: out });
  g.drawImage(out, 0, 0, w, h);
}

/* ---------- overlays: callouts, legend, title, C-arm inset ---------- */

const YEL = '#FFE14D', NAVY = 'rgba(14,30,60,0.92)';

function box(o, x, y, bw, bh, r = 8) {
  o.fillStyle = NAVY; o.beginPath(); o.roundRect(x, y, bw, bh, r); o.fill();
  o.strokeStyle = YEL; o.lineWidth = 2; o.stroke();
}

function drawCallouts(o, w, h, P, system, scale) {
  const vs = VESSELS.filter(v => v.system === system && v.label);
  let cx = 0, cy = 0, n = 0;
  for (const v of vs) for (let i = 0; i <= N; i += 15) { const q = P(v.s[i]); cx += q[0]; cy += q[1]; n++; }
  cx /= n; cy /= n;
  const fs = Math.max(12, Math.min(22, h * 0.042));
  o.font = `800 ${fs}px Archivo, Arial, sans-serif`; o.textBaseline = 'middle'; o.textAlign = 'center';
  const placed = [];
  for (const v of vs) {
    const i = Math.round(v.labelAt * N);
    const p = P(v.s[i]), q = P(v.s[Math.min(N, i + 3)]);
    let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    if (nx * (p[0] - cx) + ny * (p[1] - cy) < 0) { nx = -nx; ny = -ny; }   // point away from the tree
    const tw = o.measureText(v.label).width + fs * 1.1, th = fs * 1.6;
    let L = Math.max(46, h * 0.11), bx, by;
    for (let k = 0; k < 10; k++) {
      bx = Math.max(6, Math.min(w - tw - 6, p[0] + nx * L - tw / 2));
      by = Math.max(h * 0.2, Math.min(h - th - 6, p[1] + ny * L - th / 2));
      if (!placed.some(r => bx < r.x + r.w + 6 && bx + tw + 6 > r.x && by < r.y + r.h + 6 && by + th + 6 > r.y)) break;
      L += th * 0.8;
    }
    placed.push({ x: bx, y: by, w: tw, h: th });
    // arrow from the box to the vessel
    const ax = bx + tw / 2, ay = by + th / 2;
    const dx = p[0] - ax, dy = p[1] - ay, dl = Math.hypot(dx, dy) || 1;
    const sx2 = ax + dx / dl * Math.min(tw, th) * 0.6, sy2 = ay + dy / dl * th * 0.6;
    const ex = p[0] - dx / dl * 4, ey = p[1] - dy / dl * 4;
    o.strokeStyle = YEL; o.lineWidth = Math.max(2, fs * 0.14);
    o.beginPath(); o.moveTo(sx2, sy2); o.lineTo(ex, ey); o.stroke();
    const ah = fs * 0.55, an = Math.atan2(dy, dx);
    o.fillStyle = YEL; o.beginPath(); o.moveTo(ex, ey);
    o.lineTo(ex - ah * Math.cos(an - 0.45), ey - ah * Math.sin(an - 0.45)); o.lineTo(ex - ah * Math.cos(an + 0.45), ey - ah * Math.sin(an + 0.45)); o.closePath(); o.fill();
    box(o, bx, by, tw, th, fs * 0.4);
    o.fillStyle = '#FFFFFF'; o.fillText(v.label, bx + tw / 2, by + th / 2 + 1);
  }
  // abbreviations
  if (w >= 420) {
    const lfs = Math.max(10, Math.min(16, h * 0.03));
    const rows = vs.map(v => [v.label, NAMES[v.id] || v.name]);
    o.font = `600 ${lfs}px Inter, Arial, sans-serif`;
    const lw = Math.max(...rows.map(([a, b]) => o.measureText(`${a} = ${b}`).width)) + lfs * 1.6;
    const lh = lfs * 1.45 * (rows.length + 1) + lfs * 0.8;
    const lx = 10, ly = h - lh - 10;
    box(o, lx, ly, lw, lh, 10);
    o.textAlign = 'left'; o.font = `800 ${lfs * 1.05}px Inter, Arial, sans-serif`; o.fillStyle = YEL;
    o.fillText('Abbreviations:', lx + lfs * 0.8, ly + lfs * 1.1);
    rows.forEach(([a, b], k) => {
      const yy = ly + lfs * 1.1 + lfs * 1.45 * (k + 1);
      o.font = `800 ${lfs}px Inter, Arial, sans-serif`; o.fillStyle = YEL; o.fillText(a, lx + lfs * 0.8, yy);
      const aw = o.measureText(a).width;
      o.font = `500 ${lfs}px Inter, Arial, sans-serif`; o.fillStyle = '#FFFFFF'; o.fillText(` = ${b}`, lx + lfs * 0.8 + aw, yy);
    });
  }
  o.textAlign = 'left'; o.textBaseline = 'alphabetic';
}

function drawTitle(o, w, h, title, system) {
  const fs = Math.max(13, Math.min(26, h * 0.05));
  o.font = `800 ${fs}px Inter, Arial, sans-serif`;
  const sub = system === 'left' ? '(Left Coronary System)' : '(Right Coronary Artery)';
  const tw = Math.max(o.measureText(title).width, (o.font = `500 ${fs * 0.72}px Inter, Arial, sans-serif`, o.measureText(sub).width)) + fs * 1.2;
  const bh = fs * 2.4, x = 10, y = Math.max(24, h * 0.06);
  box(o, x, y, tw, bh, 10);
  o.textAlign = 'center'; o.fillStyle = '#FFFFFF';
  o.font = `800 ${fs}px Inter, Arial, sans-serif`; o.fillText(title, x + tw / 2, y + fs * 1.05);
  o.font = `500 ${fs * 0.72}px Inter, Arial, sans-serif`; o.fillText(sub, x + tw / 2, y + fs * 1.95);
  o.textAlign = 'left';
}

/** Two mini schematics: from the feet (LAO/RAO) and from the side (cranial/caudal), with the angles. */
function drawInset(o, w, h, lao, cra) {
  const bw = Math.min(w * 0.36, 300), bh = bw * 0.46, x = w - bw - 10, y = Math.max(24, h * 0.06);
  o.fillStyle = 'rgba(226,232,240,0.88)'; o.strokeStyle = 'rgba(255,255,255,0.9)'; o.lineWidth = 2;
  o.beginPath(); o.roundRect(x, y, bw, bh, 12); o.fill(); o.stroke();
  const fs = Math.max(9, bw * 0.05);
  const panel = (px, label, ang, text) => {
    const cx = px + bw * 0.25, cy = y + bh * 0.52, R = bh * 0.32;
    // patient
    o.fillStyle = '#1E3A5F';
    if (label === 'feet') { o.beginPath(); o.ellipse(cx, cy + R * 0.25, R * 0.55, R * 0.3, 0, 0, Math.PI * 2); o.fill(); }
    else { o.beginPath(); o.roundRect(cx - R * 0.9, cy + R * 0.15, R * 1.8, R * 0.3, 4); o.fill(); o.beginPath(); o.arc(cx - R * 0.95, cy + R * 0.18, R * 0.16, 0, Math.PI * 2); o.fill(); }
    o.fillStyle = '#334155'; o.fillRect(cx - R, cy + R * 0.48, R * 2, R * 0.12);   // table
    // C-arm and detector at the angle (0 = straight up)
    const a = ang * Math.PI / 180;
    o.strokeStyle = '#475569'; o.lineWidth = R * 0.14;
    o.beginPath(); o.arc(cx, cy, R, -Math.PI / 2 + a - 1.2, -Math.PI / 2 + a + 1.2, true); o.stroke();
    const dx = cx + Math.sin(a) * R, dy = cy - Math.cos(a) * R;
    o.save(); o.translate(dx, dy); o.rotate(a); o.fillStyle = '#0F766E'; o.fillRect(-R * 0.3, -R * 0.12, R * 0.6, R * 0.24); o.restore();
    o.strokeStyle = 'rgba(255,255,255,0.9)'; o.setLineDash([3, 3]); o.lineWidth = 1.4;
    o.beginPath(); o.moveTo(cx - Math.sin(a) * R * 0.95, cy + Math.cos(a) * R * 0.95); o.lineTo(dx, dy); o.stroke(); o.setLineDash([]);
    o.fillStyle = '#0B2545'; o.font = `800 ${fs}px Inter, Arial, sans-serif`; o.textAlign = 'center';
    o.fillText(text, cx, y + bh - fs * 0.5);
    o.font = `600 ${fs * 0.8}px Inter, Arial, sans-serif`; o.fillStyle = '#475569';
    o.fillText(label === 'feet' ? 'seen from the feet' : 'seen from the side', cx, y + fs * 1.1);
  };
  // from the feet, the patient's left is on the viewer's right: LAO swings the detector right
  panel(x, 'feet', lao, Math.abs(Math.round(lao)) < 1 ? 'AP' : `${lao > 0 ? 'LAO' : 'RAO'} ${Math.abs(Math.round(lao))}°`);
  // from the patient's left side, head to the left: cranial tilts the detector toward the head
  panel(x + bw * 0.5, 'side', -cra, Math.abs(Math.round(cra)) < 1 ? 'no tilt' : `${cra > 0 ? 'Cranial' : 'Caudal'} ${Math.abs(Math.round(cra))}°`);
  o.textAlign = 'left';
}

/* ---------- 2 · the same projection as an illustrated teaching diagram ---------- */

function segIntersect(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return null;
  const u = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  const v = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return u >= 0 && u <= 1 && v >= 0 && v <= 1 ? [a[0] + r[0] * u, a[1] + r[1] * u] : null;
}

/** Crossings between vessels of one system in this view (branch points excluded). */
export function crossings(lao, cra, system, P) {
  const vs = VESSELS.filter(v => v.system === system);
  const out = [];
  for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) {
    const A = vs[i], C = vs[j];
    for (let a = 0; a < N; a += 3) for (let c = 0; c < N; c += 3) {
      const a2 = Math.min(N, a + 3), c2 = Math.min(N, c + 3);
      if (Math.hypot(...sub(A.s[a], C.s[c])) < 2.2) continue;
      const x = segIntersect(P(A.s[a]), P(A.s[a2]), P(C.s[c]), P(C.s[c2]));
      if (x && !out.some(o => Math.hypot(o.p[0] - x[0], o.p[1] - x[1]) < 18)) out.push({ p: x, a: A.id, b: C.id });
    }
  }
  return out;
}

/**
 * state: { lao, cra, system, highlight (segment id), showOther, compact }
 * Returns notes about what the diagram found (foreshortened vessels, crossings).
 */
export function drawDiagram(g, w, h, state) {
  const { lao, cra, system = 'left', highlight = null, compact = false, lesions = LESIONS } = state;
  const { B, P, scale } = projector(lao, cra, w, h, compact ? 1 : 0.92);

  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0C1A2C'); bg.addColorStop(1, '#050B16');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,160,200,0.07)'; g.lineWidth = 1;
  for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }

  const fs = Math.max(11, Math.min(15, scale * 0.36));

  // heart silhouette
  const hl = hull(HEART_PTS.map(P));
  g.fillStyle = 'rgba(244,63,94,0.09)'; g.strokeStyle = 'rgba(244,63,94,0.4)'; g.lineWidth = 1.5; g.setLineDash([]);
  g.beginPath(); hl.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill(); g.stroke();

  // spine
  const [s0, s1] = spineLine(P);
  g.strokeStyle = 'rgba(148,180,214,0.16)'; g.lineWidth = 3.4 * scale * 0.95; g.lineCap = 'butt';
  g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.stroke();
  const sp = P([TREE.spine.x, 6, TREE.spine.z]);
  g.font = `700 ${fs}px "JetBrains Mono", monospace`; g.fillStyle = 'rgba(180,205,230,0.75)'; g.textAlign = 'center';
  g.fillText('SPINE', sp[0], Math.max(18, Math.min(h - 10, sp[1])));

  // diaphragm
  const env = domeEnvelope(P, w, h).filter(p => p[1] < h);
  if (env.length > 2) {
    g.strokeStyle = 'rgba(253,230,138,0.55)'; g.setLineDash([6, 5]); g.lineWidth = 1.6;
    g.beginPath(); env.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.setLineDash([]);
    const top = env.reduce((m, p) => (p[1] < m[1] ? p : m), env[0]);
    g.fillStyle = 'rgba(253,230,138,0.8)'; g.textAlign = 'left';
    g.fillText('diaphragm', Math.min(w - 90, top[0] + 10), top[1] - 6);
  }

  // the other system, faint
  for (const v of VESSELS) {
    if (v.system === system) continue;
    g.strokeStyle = 'rgba(160,180,200,0.13)'; g.lineWidth = Math.max(1, v.r0 * scale * 0.5); g.lineCap = 'round';
    g.beginPath(); v.s.forEach((p, i) => { const q = P(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke();
  }

  // catheter
  g.strokeStyle = 'rgba(203,213,225,0.55)'; g.lineWidth = 2.2; g.setLineDash([2, 4]);
  g.beginPath(); CATH[system].forEach((p, i) => { const q = P(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke(); g.setLineDash([]);

  // small branches, faint, in their parent's colour
  g.lineCap = 'round';
  for (const tw of TWIGS) {
    if (tw.system !== system) continue;
    g.strokeStyle = tw.color; g.globalAlpha = 0.35; g.lineWidth = Math.max(0.8, tw.r0 * scale * 0.5);
    g.beginPath(); tw.pts.forEach((p, i) => { const q = P(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke();
  }
  g.globalAlpha = 1;

  // vessels, with foreshortened stretches hatched
  const fore = [];
  const hlSeg = highlight && SEGMENTS.find(s => s.id === highlight);
  for (const v of VESSELS) {
    if (v.system !== system) continue;
    let shortRun = 0;
    for (let i = 0; i < N; i++) {
      const a3 = v.s[i], b3 = v.s[i + 1];
      const a = P(a3), b = P(b3);
      const l3 = Math.hypot(...sub(b3, a3)) * scale, l2 = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const f = l3 ? l2 / l3 : 1;
      const r = v.r0 + (v.r1 - v.r0) * (i / N);
      const lit = hlSeg && hlSeg.vessel === v.id && i / N >= hlSeg.t0 && i / N <= hlSeg.t1;
      g.lineCap = 'round';
      if (lit) { g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = r * scale * 0.5 + 8; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      g.strokeStyle = v.color;
      g.globalAlpha = f < 0.5 ? 0.45 : 1;
      g.lineWidth = r * scale * 0.5 + 2;
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.globalAlpha = 1;
      shortRun = f < 0.5 ? shortRun + 1 : 0;
      if (shortRun === 8) fore.push({ id: v.id, p: P(v.s[i - 4]) });
    }
    // lesions as seen in this view
    for (const l of lesions[v.id] || []) {
      const mid = (l.t0 + l.t1) / 2;
      let worst = 0;
      for (let k = 0; k <= 10; k++) worst = Math.max(worst, narrowing([l], l.t0 + (l.t1 - l.t0) * k / 10, B.viewer));
      const p = P(v.s[Math.round(mid * N)]);
      const pct = Math.round(worst * 100 / 5) * 5;
      g.fillStyle = pct >= 50 ? '#F43F5E' : '#94A3B8';
      g.beginPath(); g.arc(p[0], p[1], 5, 0, Math.PI * 2); g.fill();
      g.font = `700 ${fs - 1}px "JetBrains Mono", monospace`; g.textAlign = 'left';
      const txt = `${pct}%`;
      g.strokeStyle = 'rgba(5,11,22,0.9)'; g.lineWidth = 4; g.strokeText(txt, p[0] + 8, p[1] + 14);
      g.fillStyle = pct >= 50 ? '#FDA4AF' : '#CBD5E1'; g.fillText(txt, p[0] + 8, p[1] + 14);
    }
  }

  // crossings
  const xs = crossings(lao, cra, system, P);
  for (const x of xs) {
    g.strokeStyle = '#F43F5E'; g.lineWidth = 2;
    g.beginPath(); g.arc(x.p[0], x.p[1], 9, 0, Math.PI * 2); g.stroke();
  }
  for (const f of fore) {
    g.font = `${fs + 2}px sans-serif`; g.textAlign = 'center';
    g.fillText('⚠️', f.p[0] - 14, f.p[1]);
  }

  // labels, nudged apart
  const placed = [];
  g.font = `800 ${fs}px Archivo, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
  for (const v of VESSELS) {
    if (v.system !== system || !v.label) continue;
    const i = Math.round(v.labelAt * N);
    const p = P(v.s[i]), q = P(v.s[Math.min(N, i + 2)]);
    let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nn = Math.hypot(nx, ny) || 1; nx /= nn; ny /= nn;
    if (nx < 0) { nx = -nx; ny = -ny; }
    const tw = g.measureText(v.label).width + 12, th = fs + 8;
    let x = p[0] + nx * 16, y = p[1] + ny * 16;
    for (let k = 0; k < 12 && placed.some(r => x < r.x + r.w && x + tw > r.x && y - th / 2 < r.y + r.h && y + th / 2 > r.y); k++) y += th * 0.8;
    x = Math.max(4, Math.min(w - tw - 4, x)); y = Math.max(th, Math.min(h - th, y));
    placed.push({ x, y: y - th / 2, w: tw, h: th });
    g.strokeStyle = v.color; g.lineWidth = 1; g.globalAlpha = 0.7;
    g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(x, y); g.stroke(); g.globalAlpha = 1;
    g.fillStyle = 'rgba(5,11,22,0.86)';
    g.beginPath(); g.roundRect(x, y - th / 2, tw, th, 7); g.fill();
    g.strokeStyle = v.color; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = v.color; g.fillText(v.label, x + 6, y + 1);
  }
  g.textBaseline = 'alphabetic';

  // orientation compass: where head, patient's left and anterior point on this image
  if (!compact) {
    const cx = 62, cy = h - 62, R = 40;
    g.fillStyle = 'rgba(5,11,22,0.75)'; g.beginPath(); g.arc(cx, cy, R + 14, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(148,180,214,0.3)'; g.lineWidth = 1; g.stroke();
    const axes = [['H', [0, 1, 0], '#34E39A'], ['L', [1, 0, 0], '#22D3EE'], ['A', [0, 0, 1], '#F5C451']];
    for (const [k, v, c] of axes) {
      const x = dot(v, B.right), y = dot(v, B.up);
      const ex = cx + x * R, ey = cy - y * R;
      g.strokeStyle = c; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke();
      g.fillStyle = c; g.beginPath(); g.arc(ex, ey, 3, 0, Math.PI * 2); g.fill();
      g.font = `800 ${fs}px "JetBrains Mono", monospace`; g.textAlign = 'center';
      const m = Math.hypot(x, y);
      g.fillText(k, cx + (m < 0.15 ? 10 : x / m * (R + 9)), cy - (m < 0.15 ? -12 : y / m * (R + 9)) + 4);
    }
  }
  g.textAlign = 'left';
  return { crossings: xs, foreshortened: [...new Set(fore.map(f => f.id))] };
}
