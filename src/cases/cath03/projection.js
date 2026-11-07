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

let GRAIN = null;
function grainCanvas() {
  if (GRAIN) return GRAIN;
  GRAIN = document.createElement('canvas');
  GRAIN.width = GRAIN.height = 256;
  const gg = GRAIN.getContext('2d');
  const img = gg.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 26; }
  gg.putImageData(img, 0, 0);
  return GRAIN;
}

/* ---------- 1 · the angiogram as the lab monitor shows it ---------- */

/**
 * state: { lao, cra, system, t (s), fill (0–1 how far contrast has run, or 1),
 *          fade (0–1), labels, lesions }
 */
export function drawAngio(g, w, h, state) {
  const { lao, cra, system = 'left', t = 0, fill = 1, fade = 1, labels = false, lesions = LESIONS } = state;
  const beat = Math.sin(t * 2 * Math.PI * 1.2);
  const { B, P: P0, scale } = projector(lao, cra, w, h);
  const P = p => { const k = 1 + 0.016 * beat; return P0([ISO[0] + (p[0] - ISO[0]) * k, ISO[1] + (p[1] - ISO[1]) * k + 0.05 * beat, ISO[2] + (p[2] - ISO[2]) * k]); };

  // exposure: bright lung fields, darker periphery
  const bg = g.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
  bg.addColorStop(0, '#C9C9C9'); bg.addColorStop(1, '#505050');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);

  // cardiac shadow
  const hl = hull(HEART_PTS.map(P));
  g.fillStyle = 'rgba(40,40,40,0.16)';
  g.beginPath(); hl.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill();

  // spine: a column of vertebral bodies
  const [s0, s1] = spineLine(P);
  const sw = 3.4 * scale * 0.95;
  g.strokeStyle = 'rgba(60,60,60,0.28)'; g.lineWidth = sw; g.lineCap = 'butt';
  g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.stroke();
  const dx = s1[0] - s0[0], dy = s1[1] - s0[1], dl = Math.hypot(dx, dy) || 1;
  g.strokeStyle = 'rgba(45,45,45,0.22)'; g.lineWidth = Math.max(1.5, scale * 0.28);
  for (let k = 0; k <= 12; k++) {
    const f = k / 12, mx = s0[0] + dx * f, my = s0[1] + dy * f;
    g.beginPath(); g.moveTo(mx - dy / dl * sw / 2, my + dx / dl * sw / 2); g.lineTo(mx + dy / dl * sw / 2, my - dx / dl * sw / 2); g.stroke();
  }

  // diaphragm and liver
  const env = domeEnvelope(P, w, h);
  g.fillStyle = 'rgba(30,30,30,0.33)';
  g.beginPath(); g.moveTo(0, h); env.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(w, h); g.closePath(); g.fill();

  // contrast
  if (fill > 0) {
    for (const v of VESSELS) {
      if (v.system !== system) continue;
      const ls = lesions[v.id];
      for (let i = 0; i < N; i++) {
        const tt = i / N;
        const dist = (v.offset || 0) + v.len * tt;
        const front = fill * 22;
        if (dist > front) break;
        const a = P(v.s[i]), b = P(v.s[i + 1]);
        const n = narrowing(ls, tt, B.viewer);
        const r = (v.r0 + (v.r1 - v.r0) * tt) * (1 - n);
        g.strokeStyle = `rgba(14,14,14,${0.84 * fade * Math.min(1, (front - dist) / 1.2)})`;
        g.lineWidth = Math.max(1, r * 2 * scale * 0.26);
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
    }
  }

  // catheter
  const cath = CATH[system].map(P);
  g.strokeStyle = 'rgba(22,22,22,0.85)'; g.lineWidth = Math.max(2.4, scale * 0.16); g.lineCap = 'round';
  g.beginPath(); cath.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();

  if (labels && fill > 0.6) {
    g.font = `700 ${Math.max(10, Math.round(scale * 0.62))}px Archivo, sans-serif`;
    for (const v of VESSELS) {
      if (v.system !== system || !v.label) continue;
      const p = P(v.s[Math.round(v.labelAt * N)]);
      g.strokeStyle = 'rgba(0,0,0,0.85)'; g.lineWidth = 3; g.strokeText(v.label, p[0] + 6, p[1] - 4);
      g.fillStyle = '#FFE08A'; g.fillText(v.label, p[0] + 6, p[1] - 4);
    }
  }

  // grain and vignette
  const gr = grainCanvas();
  const ox = Math.random() * 64, oy = Math.random() * 64;
  g.drawImage(gr, -ox, -oy, w + 64, h + 64);
  const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.36, w / 2, h / 2, Math.max(w, h) * 0.74);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.78)');
  g.fillStyle = vg; g.fillRect(0, 0, w, h);
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
