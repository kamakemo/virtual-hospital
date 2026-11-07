/* ============================================================
   ECHO CASE 01 — WINDOWS, VIEWS AND THE PROBE
   A probe pose is a skin point S and three directions: the beam
   axis b (into the chest), the lateral axis l (across the
   sector, toward the index marker) and the plane normal n.
   The learner moves it as a sonographer does:
     slide  — move the footprint on the skin
     rotate — turn about the beam axis
     tilt   — fan the plane through the heart (about l)
     rock   — angle within the plane (about n)
   ============================================================ */

import { A, M0, T0, AV, AO, APEX, L0, PARA0, TOWIN, RA_C, dirSeg, skinZ, rot, V } from './heart.js';

const { norm, dot, add, sub, cross, perp } = V;
const onSkin = (x, y) => [x, y, skinZ(x, y)];

/** The skin point near (x0, y0) that best satisfies cond (→ 0): where the probe must sit for this plane. */
function fitSkin(cond, x0, y0, reach = 4) {
  let best = null, bv = 1e9;
  for (let x = x0 - reach; x <= x0 + reach; x += 0.1) for (let y = y0 - reach; y <= y0 + reach; y += 0.1) {
    const S = onSkin(x, y);
    const v = Math.abs(cond(S)) + 0.015 * ((x - x0) ** 2 + (y - y0) ** 2);
    if (v < bv) { bv = v; best = S; }
  }
  return best;
}
const plaxN = norm(cross(A, TOWIN));
const PARA = PARA0;
const shortAxisSkin = (C, axis, x0, y0) => fitSkin(S => dot(norm(sub(C, S)), axis) * 6, x0, y0, 5);

// acoustic windows on the skin
const apicalSkin = (() => {
  // follow the long axis out of the apex until it meets the chest wall
  for (let k = 0; k < 12; k += 0.1) { const p = add(APEX, A, k); if (p[2] >= skinZ(p[0], p[1]) - 0.2) return onSkin(p[0], p[1]); }
  return onSkin(APEX[0], APEX[1]);
})();
// subcostal: on the four-chamber plane, under the costal margin
const SUBX = onSkin(0.4, -12.5);
// the plane through the subxiphoid window that contains the LV long axis: apex to the right, seen from below
const a4cN = norm(cross(A, sub(SUBX, M0)));
export const WINDOWS = {
  para: { id: 'para', name: 'Left parasternal', emoji: '🫁', S: PARA, home: 'plax', where: '3rd–4th intercostal space, left sternal edge' },
  apical: { id: 'apical', name: 'Apical', emoji: '🔻', S: apicalSkin, home: 'a4c', where: 'Over the apex beat — 5th space, anterior axillary line, patient turned onto the left side' },
  sub: { id: 'sub', name: 'Subcostal', emoji: '⤴️', S: SUBX, home: 'sub4c', where: 'Below the xiphoid, probe flat, aiming at the left shoulder' },
};

/** Build a probe basis on window S aimed at C, with the plane normal as close to n0 as the beam allows. */
function basisFrom(S, C, n0, right) {
  const b = norm(sub(C, S));
  const n = perp(n0, b);
  let l = norm(cross(n, b));
  if (dot(l, right) < 0) l = l.map(x => -x);
  return { S, b, l, n: norm(cross(b, l)) };
}

const mid = add(M0, A, 1.6);
export const VIEWS = [
  { id: 'plax', win: 'para', name: 'Parasternal long axis', short: 'PLAX', emoji: '📏', depth: 16,
    S: PARA, C: mid, n0: plaxN, right: A.map(x => -x),
    land: [['Mitral valve', M0], ['Aortic valve', AV]], avoid: [],
    shows: 'RV free wall on top, then the septum, the LV cavity and the inferolateral wall; aortic root and valve on the right, mitral valve, left atrium — and the descending aorta behind it.',
    how: 'Index marker toward the right shoulder. Septum and posterior wall horizontal and parallel; aortic and mitral valves both cut through their middle.',
    pit: 'Too high and the LV looks foreshortened toward the apex; too low and the aorta drops out. The apex is never in this view.' },
  { id: 'psax-av', win: 'para', name: 'Parasternal short axis — aortic valve', short: 'PSAX AV', emoji: '⭕', depth: 14,
    S: PARA, C: AV, n0: AO, right: dirSeg(270),
    land: [['Aortic valve', AV]], avoid: [],
    shows: 'The aortic valve as a “Mercedes-Benz” sign in diastole, ringed by the RV outflow, the left and right atria and the tricuspid valve.',
    how: 'From PLAX rotate 90° clockwise (marker to the left shoulder) and tilt up toward the right shoulder.',
    pit: 'An oblique cut makes a normal tricuspid valve look bicuspid.' },
  { id: 'psax-mv', win: 'para', name: 'Parasternal short axis — mitral', short: 'PSAX MV', emoji: '🐟', depth: 16,
    S: PARA, C: add(M0, A, 1.0), n0: A, right: dirSeg(270),
    land: [['Mitral leaflets', add(M0, A, 1.0)]], avoid: [],
    shows: 'The “fish mouth” of the mitral valve opening and closing; the six basal segments.',
    how: 'From PSAX AV fan the beam down toward the apex until the leaflets appear.',
    pit: 'If the ring is oval the cut is oblique — rotate until it is round.' },
  { id: 'psax-pm', win: 'para', name: 'Parasternal short axis — papillary muscles', short: 'PSAX PM', emoji: '🍩', depth: 16,
    S: PARA, C: add(M0, A, 3.8), n0: A, right: dirSeg(270),
    land: [['Mid LV', add(M0, A, 3.8)]], avoid: [],
    shows: 'The mid ventricle as a doughnut with both papillary muscles; all six mid segments and all three coronary territories in one image.',
    how: 'Keep fanning toward the apex. The best single view of regional wall motion.',
    pit: 'An oval cavity means the plane is oblique: wall thickening will look falsely uneven.' },
  { id: 'psax-ap', win: 'para', name: 'Parasternal short axis — apex', short: 'PSAX apex', emoji: '🔘', depth: 16,
    S: shortAxisSkin(add(M0, A, 6.6), A, PARA[0] + 2, PARA[1] - 3.5), C: add(M0, A, 6.6), n0: A, right: dirSeg(270),
    land: [['Apical LV', add(M0, A, 6.6)]], avoid: [],
    shows: 'The apical segments — in this patient a ring that does not move.',
    how: 'Slide one space down and fan further toward the apex.', pit: 'Often poorly seen from the parasternal window; confirm from the apex.' },
  { id: 'a4c', win: 'apical', name: 'Apical four-chamber', short: 'A4C', emoji: '🔲', depth: 18,
    C: add(M0, A, 2.0), n0: cross(A, sub(T0, M0)), right: dirSeg(270),
    land: [['True apex', APEX], ['Mitral valve', M0], ['Tricuspid valve', T0]], avoid: [['LVOT / aortic valve', AV]],
    shows: 'Apex at the top, LV on the right, RV on the left, both atria below, both AV valves — the septum straight down the middle.',
    how: 'Probe on the apex beat, marker toward the left side (3 o’clock). The LV must be long and bullet-shaped, not round.',
    pit: 'FORESHORTENING: one space too high or too medial and the plane misses the true apex — the LV looks short and round, and apical thrombus and apical akinesis vanish.' },
  { id: 'a5c', win: 'apical', name: 'Apical five-chamber', short: 'A5C', emoji: '🖐️', depth: 18,
    C: add(AV, T0).map(v => v / 2), n0: cross(sub(AV, apicalSkin), sub(T0, apicalSkin)), right: dirSeg(270),
    land: [['True apex', APEX], ['Aortic valve (LVOT)', AV], ['Tricuspid valve', T0]], avoid: [],
    shows: 'The four chambers plus the LVOT and aortic valve — for LVOT Doppler.',
    how: 'From A4C tilt the beam anteriorly (fan up), rotating slightly, until the LVOT and aortic valve open between the two ventricles.', pit: 'Do not grade the septum here — it is an oblique cut.' },
  { id: 'a2c', win: 'apical', name: 'Apical two-chamber', short: 'A2C', emoji: '⬛', depth: 18,
    C: add(M0, A, 2.0), n0: cross(A, dirSeg(0)), right: dirSeg(0),
    land: [['True apex', APEX], ['Mitral valve', M0]], avoid: [['Tricuspid / RV', T0], ['Aortic valve', AV]],
    shows: 'LV and LA only: inferior wall on the left, anterior wall on the right.',
    how: 'From A4C rotate the probe about 60° anticlockwise until the RV disappears.',
    pit: 'If the RV is still in the picture you have not rotated enough.' },
  { id: 'a3c', win: 'apical', name: 'Apical three-chamber (long axis)', short: 'A3C', emoji: '📐', depth: 18,
    C: add(M0, A, 2.0), n0: cross(A, sub(AV, M0)), right: perp(sub(AV, M0), A),
    land: [['True apex', APEX], ['Mitral valve', M0], ['Aortic valve', AV]], avoid: [],
    shows: 'The apical version of PLAX: anteroseptum and inferolateral wall, the LVOT and aortic valve.',
    how: 'From A2C rotate a further ~60° anticlockwise until the aorta opens.', pit: 'The anteroseptum here is the LAD territory — compare with A4C.' },
  { id: 'sub4c', win: 'sub', name: 'Subcostal four-chamber', short: 'Sub 4C', emoji: '🧊', depth: 20,
    C: add(M0, A, 2.0), n0: a4cN, right: A,
    land: [['Mitral valve', M0], ['LV apex', APEX]], avoid: [],
    shows: 'Liver at the top, then the RV free wall, the septum and the LV; the interatrial septum perpendicular to the beam.',
    how: 'Probe flat under the xiphoid, aiming at the left shoulder; knees bent to relax the abdomen.',
    pit: 'The view for effusion and RV free wall in ventilated or post-operative patients — but it foreshortens the LV.' },
];
export const VIEW_BY_ID = Object.fromEntries(VIEWS.map(v => [v.id, v]));

export function viewBasis(v) {
  return basisFrom(v.S || WINDOWS[v.win].S, v.C, v.n0, v.right);
}

/** The classic mistake: one interspace too high and too medial on the apical window. */
export const FORESHORTENED = (() => {
  const w = WINDOWS.apical.S;
  const S = onSkin(w[0] - 1.8, w[1] + 2.3);
  const v = VIEW_BY_ID.a4c;
  return basisFrom(S, M0, v.n0, v.right);
})();

/** Apply the sonographer's movements to a base pose. */
export function applyPose(base, { dx = 0, dy = 0, rotDeg = 0, tilt = 0, rock = 0 }) {
  const S = onSkin(base.S[0] + dx, base.S[1] + dy);
  const l1 = rot(base.l, base.b, rotDeg), n1 = rot(base.n, base.b, rotDeg);
  const b2 = rot(base.b, l1, tilt), n2 = rot(n1, l1, tilt);
  const b3 = rot(b2, n2, rock), l3 = rot(l1, n2, rock);
  return { S, b: norm(b3), l: norm(l3), n: norm(n2) };
}

/** Where a 3D point lands in the sector: depth along the beam, lateral offset, distance off the plane. */
export function inPlane(pose, p) {
  const d = sub(p, pose.S);
  return { depth: dot(d, pose.b), lat: dot(d, pose.l), off: dot(d, pose.n) };
}

const SECTOR = 40;   // half-angle, degrees

/** How good this pose is as `view`: 0–100 with a checklist. */
export function viewQuality(pose, view, depth = view.depth) {
  // judged against the best plane reachable from this view's window (short axes from the
  // parasternal window are slightly oblique — as at the bedside)
  const n0 = view.nIdeal || (view.nIdeal = viewBasis(view).n);
  const ang = Math.acos(Math.min(1, Math.abs(dot(pose.n, n0)))) * 180 / Math.PI;
  const checks = [];
  let q = 100 - Math.max(0, ang - 4) * 2.2;
  for (const [name, p] of view.land) {
    const { depth: d, lat, off } = inPlane(pose, p);
    const inSector = d > 0.5 && d < depth && Math.abs(Math.atan2(lat, d) * 180 / Math.PI) < SECTOR;
    const ok = Math.abs(off) < 0.75 && inSector;
    q -= Math.max(0, Math.abs(off) - 0.4) * 14 + (inSector ? 0 : 25);
    checks.push({ name, ok, note: !inSector ? 'outside the sector' : Math.abs(off) >= 0.75 ? `${Math.abs(off).toFixed(1)} cm off the plane` : 'in the plane' });
  }
  for (const [name, p] of view.avoid) {
    const { depth: d, lat, off } = inPlane(pose, p);
    const seen = Math.abs(off) < 0.7 && d > 0 && d < depth && Math.abs(Math.atan2(lat, d) * 180 / Math.PI) < SECTOR;
    if (seen) q -= 25;
    checks.push({ name: `No ${name}`, ok: !seen, note: seen ? 'it is in the picture' : 'out of the picture' });
  }
  return { q: Math.max(0, Math.min(100, Math.round(q))), ang: Math.round(ang), checks };
}

/** Distance from the true apex to the imaging plane (cm): the foreshortening check. */
export const apexOff = pose => Math.abs(inPlane(pose, APEX).off);
export { SECTOR, L0 };
