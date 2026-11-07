/* ============================================================
   CARDIAC IMAGING · ECHO CASE 01 — THE HEART IN 3D
   An analytic, beating heart in the chest. Every structure is
   a shape in the patient frame (x = patient's LEFT,
   y = CRANIAL, z = ANTERIOR, cm), so an echo image is simply
   the plane of the ultrasound beam cutting through it: whatever
   the plane misses is not on the screen. That is why a
   foreshortened apical view can miss an apical thrombus.

   This patient: a late-presenting anterior STEMI three weeks
   ago — LAD-territory akinesis, a thin dyskinetic apical
   aneurysm, a laminated apical thrombus, a dilated LV with an
   ejection fraction about one third.
   ============================================================ */

const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k, p[2] + q[2] * k];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
const perp = (v, a) => norm(sub(v, [a[0] * dot(v, a), a[1] * dot(v, a), a[2] * dot(v, a)]));
export const V = { norm, dot, add, sub, cross, perp };

/** Rotate v about unit axis k by deg (Rodrigues). */
export function rot(v, k, deg) {
  const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  const kv = cross(k, v), kd = dot(k, v);
  return [0, 1, 2].map(i => v[i] * c + kv[i] * s + k[i] * kd * (1 - c));
}

/* ---------- the frame of the heart ---------- */

export const A = norm([0.66, -0.5, 0.5]);               // long axis, base → apex (left, inferior, anterior)
export const M0 = [1.0, -2.6, -0.6];                     // mitral annulus centre at end-diastole
export const ANT = perp([0, 0, 1], A);                  // anterior direction in short axis
const e2 = norm(cross(A, ANT));
export const SEP = e2[0] < 0 ? e2 : e2.map(v => -v);     // toward the patient's right
/** Unit direction in the short-axis plane at model angle psi (deg) from ANT toward SEP. */
export const dirAt = psi => norm(add(ANT.map(v => v * Math.cos(psi * Math.PI / 180)), SEP, Math.sin(psi * Math.PI / 180)));
export const PARA0 = [2.6, -1.8, skinZ(2.6, -1.8)];     // left sternal edge, 3rd–4th space
// toward the parasternal window, square to the long axis at the base
export const TOWIN = perp(sub(PARA0, add(M0, A, 1.6)), A);
const PSI_WIN = Math.atan2(dot(TOWIN, SEP), dot(TOWIN, ANT)) * 180 / Math.PI;
// The window looks onto the ANTEROSEPTUM (60° in the 17-segment wheel); everything else follows:
// PLAX → anteroseptal/inferolateral, A4C → inferoseptal/anterolateral, A2C → anterior/inferior.
export const SEG_OFFSET = 60 - PSI_WIN;
/** Direction of a 17-segment wheel angle (0 anterior, 60 anteroseptal, 120 inferoseptal, 180 inferior…). */
export const dirSeg = deg => dirAt(deg - SEG_OFFSET);
export const L0 = 8.6;                                  // base → endocardial apex, end-diastole
export const APEX = add(M0, A, L0);                     // the apex hardly moves; the base descends
export const T0 = add(add(M0, dirSeg(120), 3.3), A, 0.9); // tricuspid annulus: apically offset from the mitral
export const AV = add(add(M0, TOWIN, 2.1), A, -0.75);    // aortic valve: anterior, under the window
export const AO = norm([-0.25, 1.0, 0.18]);              // ascending aorta axis
export const LA_C = add(add(M0, A, -2.5), TOWIN, -0.9);
export const RA_C = add(add(T0, A, -2.4), dirSeg(120), 0.5);
export const RV_C = add(add(M0, A, 3.3), dirSeg(85), 3.2);
export const RV_AX = { a: 4.8, s: 2.2, q: 3.9 };
const PERI_C = add(add(M0, A, 3.4), dirSeg(105), 1.3);
const LVOT0 = add(add(M0, A, 1.7), TOWIN, 0.9);
export const THROMBUS = add(add(APEX, A, -1.0), dirSeg(0), 0.35);
export const DESC_AO = { x: 2.2, z: -7.6, r: 1.2 };

/* ---------- the cardiac cycle ---------- */

export const HR = 96;
/** Systolic activation 0 (end-diastole) → 1 (end-systole); phase in [0, 1). */
export function sys(ph) {
  if (ph < 0.35) return 0.5 - 0.5 * Math.cos(Math.PI * ph / 0.35);
  if (ph < 0.55) return 0.5 + 0.5 * Math.cos(Math.PI * (ph - 0.35) / 0.2);
  return 0;
}
export const ES = 0.35;
/** Mitral opening 0–1: E wave early in diastole, A wave at the end. */
function mvOpen(ph) {
  if (ph < 0.38) return 0;
  const e = ph < 0.72 ? Math.sin(Math.PI * (ph - 0.38) / 0.34) : 0;
  const a = ph > 0.84 ? Math.sin(Math.PI * (ph - 0.84) / 0.16) : 0;
  return Math.max(e, 0.7 * a, ph < 0.72 || ph > 0.84 ? 0 : 0.25);
}

/* ---------- regional wall motion: the 17-segment model ---------- */

export const SEGMENTS = [
  'basal anterior', 'basal anteroseptal', 'basal inferoseptal', 'basal inferior', 'basal inferolateral', 'basal anterolateral',
  'mid anterior', 'mid anteroseptal', 'mid inferoseptal', 'mid inferior', 'mid inferolateral', 'mid anterolateral',
  'apical anterior', 'apical septal', 'apical inferior', 'apical lateral', 'apex',
];
// 0 normal, 1 hypokinetic, 2 akinetic, 3 dyskinetic/aneurysmal
export const MOTION = [0, 1, 0, 0, 0, 0, 2, 2, 1, 0, 0, 1, 3, 3, 2, 2, 3];
const SHORTEN = [0.27, 0.12, 0, -0.06];
const THICK = [1.05, 0.95, 0.8, 0.55];

/** Segment index from height along the axis (0 base … 1 apex) and angle from anterior (deg, toward septum positive). */
export function segmentOf(f, psi) {
  const ang = (((psi + SEG_OFFSET) % 360) + 360) % 360;
  if (f > 0.9) return 16;
  if (f > 0.66) return 12 + [0, 1, 2, 3][Math.floor(((ang + 45) % 360) / 90)];
  const six = Math.floor(((ang + 30) % 360) / 60);          // 0 ant, 1 antsep, 2 infsep, 3 inf, 4 inflat, 5 antlat
  return (f > 0.33 ? 6 : 0) + six;
}

/* ---------- LV geometry ---------- */

function lvFrame(p, ph) {
  const s = sys(ph);
  const base = add(M0, A, 0.6 * s);                      // MAPSE ≈ 6 mm: reduced
  const L = L0 - 0.6 * s;
  const d = sub(p, base);
  const t = dot(d, A);
  const r = sub(d, [A[0] * t, A[1] * t, A[2] * t]);
  const rho = Math.hypot(r[0], r[1], r[2]);
  const psi = Math.atan2(dot(r, SEP), dot(r, ANT)) * 180 / Math.PI;
  return { s, t, L, rho, psi, f: t / L };
}

function lvRadii(fr) {
  const { s, f, psi } = fr;
  const seg = segmentOf(Math.max(0, f), psi);
  const m = MOTION[seg];
  // aneurysm: the apical third balloons and thins
  const ap = Math.max(0, Math.min(1, (f - 0.58) / 0.25));
  const bulge = ap * ap * (3 - 2 * ap) * 0.75 * (1 + 0.08 * s);
  const R = (3.0 + bulge) * (1 - SHORTEN[m] * s);
  const th = THICK[m] * (1 + (m === 0 ? 0.45 : m === 1 ? 0.2 : 0) * s);
  return { R, th, seg, m, bulge };
}

/** 0 outside, 1 cavity, 2 myocardium (with segment). */
function lv(p, ph) {
  const fr = lvFrame(p, ph);
  if (fr.t < -0.25) return null;
  const { R, th, seg, m } = lvRadii(fr);
  const c = 0.25 * fr.L, Ax = 0.75 * fr.L + 0.35 * (fr.f > 0.6 ? 1 : 0);
  const ei = ((fr.t - c) / Ax) ** 2 + (fr.rho / R) ** 2;
  if (fr.t >= 0 && ei < 1) return { k: 'lvc', fr };
  const eo = ((fr.t - c) / (Ax + th)) ** 2 + (fr.rho / (R + th)) ** 2;
  if (eo < 1) return { k: m >= 2 && fr.f > 0.55 ? 'scar' : 'myo', seg, m, fr };
  return null;
}

function inEll(p, c, ax, a, b, q) {
  const d = sub(p, c);
  const t = dot(d, ax.a), u = dot(d, ax.b), w = dot(d, ax.c);
  return (t / a) ** 2 + (u / b) ** 2 + (w / q) ** 2;
}
export const RV_FRAME = { a: A, b: dirSeg(85), c: norm(cross(A, dirSeg(85))) };

function segDist(p, a, b) {
  const ab = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / dot(ab, ab)));
  return Math.hypot(...sub(p, add(a, ab, t)));
}

/**
 * What the beam meets at point p in phase ph.
 * Returns { k: tissue kind, v: echogenicity 0–1, seg?, m? }.
 */
export function classify(p, ph) {
  // thrombus sits in the apex — it does not move with the base
  const th = sub(p, THROMBUS);
  const tA = dot(th, A), tS = dot(th, dirSeg(90)), tQ = dot(th, dirSeg(0));
  const inThrombus = (tA / 1.0) ** 2 + (tS / 0.75) ** 2 + (tQ / 0.85) ** 2 < 1;

  const s = sys(ph);
  // aortic root and valve
  const da = sub(p, AV);
  const h = dot(da, AO);
  const rr = Math.hypot(...sub(da, [AO[0] * h, AO[1] * h, AO[2] * h]));
  if (h > -0.4 && h < 6.5) {
    const R = h < 2.2 ? 1.35 + 0.35 * Math.sin(Math.max(0, h) / 2.2 * Math.PI) : 1.45;
    if (rr < R) {
      if (s > 0.15) { if (rr > R - 0.34 && h > 0 && h < 1.4) return { k: 'valve', v: 0.9 }; }
      else if (h > -0.35 && h < 0.08) {
        const ang = Math.atan2(dot(da, dirSeg(90)), dot(da, dirSeg(0)));
        const lineD = Math.min(...[Math.PI / 2, Math.PI / 2 + 2.094, Math.PI / 2 + 4.189].map(o => { const d = Math.abs(((ang - o) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); return d; }));   // three commissural rays: the Mercedes sign
        if (lineD * rr < 0.15 || rr < 0.16) return { k: 'valve', v: 0.9 };
      }
      return { k: 'ao', v: 0.03 };
    }
    if (rr < R + 0.3) return { k: 'aow', v: 0.8 };
  }
  // LVOT
  if (segDist(p, LVOT0, AV) < 1.05) return inThrombus ? { k: 'thrombus', v: 0.55 } : { k: 'lvc', v: 0.03 };

  // mitral valve (moves with the base)
  const base = add(M0, A, 0.6 * s);
  const dm = sub(p, base);
  const tm = dot(dm, A);
  const rm = Math.hypot(...sub(dm, [A[0] * tm, A[1] * tm, A[2] * tm]));
  const op = mvOpen(ph);
  if (rm < 1.85 && tm > -0.15 && tm < 2.5) {
    const toAnt = dot(sub(dm, [A[0] * tm, A[1] * tm, A[2] * tm]), TOWIN) > 0;
    const len = toAnt ? 2.4 : 1.5;
    if (op < 0.08) {
      // closed: leaflets meet a little beyond the annulus (tethered, tenting)
      if (Math.abs(tm - (0.25 + 0.35 * (1 - rm / 1.85))) < 0.16 && rm < 1.75) return { k: 'valve', v: 0.88 };
    } else {
      const ang = (0.25 + 0.75 * op) * 1.1;                // opening angle from the annular plane
      const along = tm / Math.sin(ang);
      const expect = 1.75 - along * Math.cos(ang);
      if (along > 0 && along < len && Math.abs(rm - expect) < 0.17) return { k: 'valve', v: 0.88 };
    }
  }

  const l = lv(p, ph);
  if (l?.k === 'lvc') return inThrombus ? { k: 'thrombus', v: 0.58 } : { k: 'lvc', v: 0.03 };
  if (l) return { k: l.k, v: l.k === 'scar' ? 0.78 : 0.5, seg: l.seg, m: l.m };

  // tricuspid valve
  const dt = sub(p, add(T0, A, 0.3 * s));
  const tt = dot(dt, A);
  const rt = Math.hypot(...sub(dt, [A[0] * tt, A[1] * tt, A[2] * tt]));
  if (rt < 1.6 && tt > -0.15 && tt < 2.2) {
    if (op < 0.08) { if (Math.abs(tt - 0.2) < 0.15 && rt < 1.5) return { k: 'valve', v: 0.82 }; }
    else {
      const ang = (0.25 + 0.75 * op) * 1.1, along = tt / Math.sin(ang), expect = 1.5 - along * Math.cos(ang);
      if (along > 0 && along < 1.8 && Math.abs(rt - expect) < 0.16) return { k: 'valve', v: 0.82 };
    }
  }

  // right ventricle
  const scale = 1 - 0.12 * s;
  const erv = inEll(p, RV_C, RV_FRAME, RV_AX.a, RV_AX.s * scale, RV_AX.q * scale);
  if (erv < 1) return { k: 'rvc', v: 0.03 };
  if (inEll(p, RV_C, RV_FRAME, RV_AX.a + 0.4, RV_AX.s * scale + 0.45, RV_AX.q * scale + 0.45) < 1) return { k: 'rvw', v: 0.48 };

  // atria
  const dla = Math.hypot(...sub(p, LA_C)), dra = Math.hypot(...sub(p, RA_C));
  const rla = 2.35 + 0.15 * s, rra = 2.05 + 0.12 * s;
  if (dla < rla) return { k: 'la', v: 0.03 };
  if (dra < rra) return { k: 'ra', v: 0.03 };
  if (dla < rla + 0.32 || dra < rra + 0.3) return { k: 'aw', v: 0.62 };

  // descending aorta behind the left atrium
  const dd = Math.hypot(p[0] - DESC_AO.x, p[2] - DESC_AO.z);
  if (p[1] < 6 && p[1] > -14) {
    if (dd < DESC_AO.r) return { k: 'dao', v: 0.03 };
    if (dd < DESC_AO.r + 0.3) return { k: 'aow', v: 0.8 };
  }

  // diaphragm and liver below it (the subcostal window looks through the liver)
  const dia = -9.2 - 0.03 * (p[0] - 1) ** 2 - 0.02 * p[2] ** 2;
  if (p[1] < dia) return Math.abs(p[1] - dia) < 0.35 ? { k: 'dia', v: 0.85 } : { k: 'liver', v: 0.42 };

  // chest wall under the probe: skin, fat, intercostal muscle
  if (p[2] > skinZ(p[0], p[1]) - 1.3) return { k: 'wall', v: 0.55 };

  // pericardium: a bright sac round the heart, fat in the grooves inside it
  const ep = inEll(p, PERI_C, RV_FRAME, 7.4, 6.0, 5.6);
  if (ep < 0.86) return { k: 'fat', v: 0.5 };
  if (ep < 1) return { k: 'peri', v: 0.95 };

  // chest wall in front, lung everywhere else
  if (p[2] > skinZ(p[0], p[1]) - 1.6) return { k: 'wall', v: 0.55 };
  return { k: 'lung', v: 0.12 };
}

/** Anterior chest surface (z) — curving back laterally and below the costal margin. */
export function skinZ(x, y) {
  return 7.0 - 0.018 * x * x - (y < -10 ? 0.25 * (-10 - y) : 0);
}

/* ---------- volumes and ejection fraction (by numerical integration) ---------- */

export function lvVolume(ph) {
  const s = sys(ph);
  const L = L0 - 0.6 * s;
  let vol = 0;
  const nT = 60, nP = 36;
  for (let i = 0; i < nT; i++) {
    const t = (i + 0.5) / nT * (L + 0.6);
    const f = t / L;
    let area = 0;
    for (let j = 0; j < nP; j++) {
      const psi = j / nP * 360 - 180;
      const { R } = lvRadii({ s, f, psi });
      const c = 0.25 * L, Ax = 0.75 * L + 0.35 * (f > 0.6 ? 1 : 0);
      const k = 1 - ((t - c) / Ax) ** 2;
      const r = k > 0 ? R * Math.sqrt(k) : 0;
      area += 0.5 * r * r * (2 * Math.PI / nP);
    }
    vol += area * (L + 0.6) / nT;
  }
  return vol;
}
export const EDV = lvVolume(0), ESV = lvVolume(ES);
export const EF = (EDV - ESV) / EDV;
