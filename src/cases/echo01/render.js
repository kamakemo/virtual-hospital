/* ============================================================
   ECHO CASE 01 — THE IMAGE
   For every pixel of the sector, find the 3D point the beam
   reaches (probe skin point + depth along the beam + lateral
   offset across the sector), ask the heart what tissue is there,
   and paint its echogenicity with speckle that belongs to the
   probe (as on a real scanner), attenuation with depth, lung
   reverberation, and near-field clutter.

   The same sampling, painted in flat colours with labels and
   the wall segments coloured by how they move, is the
   illustrated diagram.
   ============================================================ */

import { classify, SEGMENTS, MOTION, HR, sys } from './heart.js';
import { SECTOR } from './views.js';

const RAD = Math.PI / 180;
const NOISE = (() => { const a = new Float32Array(1 << 16); let s = 12345; for (let i = 0; i < a.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; a[i] = s / 0x7fffffff; } return a; })();

const SHORT = { lvc: 'LV', rvc: 'RV', la: 'LA', ra: 'RA', ao: 'Ao', dao: 'DAo', thrombus: 'Thrombus', liver: 'Liver' };
const DIAG = {
  lvc: [120, 22, 38], rvc: [24, 64, 140], la: [150, 70, 90], ra: [70, 90, 160], ao: [190, 60, 60], dao: [190, 60, 60],
  myo: [205, 160, 120], scar: [235, 235, 235], rvw: [150, 140, 180], aw: [170, 150, 160], aow: [230, 180, 180],
  valve: [255, 255, 255], peri: [250, 220, 120], fat: [90, 80, 60], liver: [120, 80, 50], dia: [200, 170, 120],
  wall: [70, 70, 80], lung: [28, 36, 48], thrombus: [168, 85, 247],
};
const MOTION_COL = [[52, 227, 154], [245, 196, 81], [251, 113, 133], [192, 132, 252]];
export const MOTION_NAMES = ['normal', 'hypokinetic', 'akinetic', 'dyskinetic / aneurysmal'];

/** Geometry of the sector on a canvas of w × h for a given depth (cm). */
export function sectorGeom(w, h, depth) {
  const top = 26, bottom = 54;
  const scale = Math.min((h - top - bottom) / depth, (w - 30) / (2 * depth * Math.sin(SECTOR * RAD)));
  return { cx: w / 2, cy: top, scale };
}

let BUF = null;
function buffer(rw, rh) {
  if (!BUF || BUF.width !== rw || BUF.height !== rh) { BUF = document.createElement('canvas'); BUF.width = rw; BUF.height = rh; }
  return BUF;
}

/**
 * Sample the plane. Calls fn(i, j, tissue, r, theta) for each buffer pixel in the sector.
 * Returns the buffer geometry.
 */
function sweep(w, h, pose, depth, phase, rw, fn) {
  const G = sectorGeom(w, h, depth);
  const rh = Math.round(rw * h / w);
  const k = w / rw;
  const { S, b, l } = pose;
  const tan = Math.tan(SECTOR * RAD);
  for (let j = 0; j < rh; j++) {
    const Y = ((j + 0.5) * k - G.cy) / G.scale;
    if (Y <= 0 || Y > depth) continue;
    for (let i = 0; i < rw; i++) {
      const X = ((i + 0.5) * k - G.cx) / G.scale;
      if (Math.abs(X) > Y * tan) continue;
      const r = Math.hypot(X, Y);
      if (r > depth) continue;
      const p = [S[0] + b[0] * Y + l[0] * X, S[1] + b[1] * Y + l[1] * X, S[2] + b[2] * Y + l[2] * X];
      fn(i, j, classify(p, phase), r, Math.atan2(X, Y) / RAD);
    }
  }
  return { G, rh, k };
}

function sectorPath(g, G, depth) {
  g.beginPath();
  g.moveTo(G.cx, G.cy);
  g.arc(G.cx, G.cy, depth * G.scale, (90 + SECTOR) * RAD, (90 - SECTOR) * RAD, true);
  g.closePath();
}

function ecg(g, w, h, phase) {
  const y0 = h - 22, x0 = 14, x1 = w - 14;
  g.strokeStyle = '#34E39A'; g.lineWidth = 1.5; g.beginPath();
  for (let x = x0; x <= x1; x++) {
    const f = ((x - x0) / (x1 - x0) * 2) % 1;                 // two beats across the strip
    let y = 0;
    const qrs = f - 0.02;
    if (qrs > 0 && qrs < 0.06) y = qrs < 0.02 ? -qrs * 300 : qrs < 0.04 ? -6 + (qrs - 0.02) * 900 : 12 - (qrs - 0.04) * 600;
    else if (f > 0.25 && f < 0.42) y = -4 * Math.sin((f - 0.25) / 0.17 * Math.PI);
    else if (f > 0.88 && f < 0.96) y = -2 * Math.sin((f - 0.88) / 0.08 * Math.PI);
    x === x0 ? g.moveTo(x, y0 + y) : g.lineTo(x, y0 + y);
  }
  g.stroke();
  const mx = x0 + (phase / 2 + 0.5 * (Math.floor(performance.now() / 1000 * HR / 60) % 2)) * (x1 - x0);
  g.fillStyle = '#F5C451'; g.fillRect(mx - 1, y0 - 14, 2, 22);
}

/**
 * state: { pose, depth, phase, gain (0.6–1.6), labels, title, rw }
 */
export function drawEcho(g, w, h, state) {
  const { pose, depth, phase, gain = 1, labels = false, title = '', rw = 200 } = state;
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  const rh = Math.round(rw * h / w);
  const buf = buffer(rw, rh);
  const bg = buf.getContext('2d');
  const img = bg.createImageData(rw, rh);
  const D = img.data;
  const flick = Math.floor(performance.now() / 70) & 7;
  const cent = {};
  const { G } = sweep(w, h, pose, depth, phase, rw, (i, j, tis, r, th) => {
    const ni = ((Math.floor(r * 9) * 211 + Math.floor((th + 50) * 2.2) * 7 + flick * 3) & 0xffff);
    const n = NOISE[ni], n2 = NOISE[(ni * 31 + 17) & 0xffff];
    let v;
    if (tis.v < 0.06) v = 0.02 + 0.05 * n * n2 + (r < 2 ? 0.08 : 0);                  // blood: near black
    else if (tis.k === 'lung') v = 0.06 + 0.22 * n * (0.5 + 0.5 * Math.cos(r * 4.2)) ** 6 + 0.08 * n2;  // A-line reverberation
    else v = tis.v * (0.35 + 1.05 * n * (0.6 + 0.4 * n2));
    v *= Math.exp(-0.045 * r) * (1 + 0.032 * r) * gain;                               // attenuation, partly compensated
    if (r < 1.2) v += 0.25 * NOISE[(ni + 999) & 0xffff];                              // near-field clutter
    const c = Math.max(0, Math.min(255, v * 255));
    const o = (j * rw + i) * 4;
    D[o] = c * 0.96; D[o + 1] = c * 0.98; D[o + 2] = c; D[o + 3] = 255;
    if (labels && SHORT[tis.k]) { const e = cent[tis.k] || (cent[tis.k] = [0, 0, 0]); e[0] += i; e[1] += j; e[2]++; }
  });
  bg.putImageData(img, 0, 0);
  g.save();
  sectorPath(g, G, depth); g.clip();
  g.imageSmoothingEnabled = true;
  g.drawImage(buf, 0, 0, w, h);
  g.restore();

  // depth scale and the orientation marker (index side = screen right)
  g.fillStyle = '#9FB4C6'; g.font = '600 10px "JetBrains Mono", monospace'; g.textAlign = 'left';
  for (let d = 0; d <= depth; d += 1) {
    const y = G.cy + d * G.scale;
    g.fillRect(w - 10, y, d % 5 === 0 ? 8 : 4, 1);
    if (d % 5 === 0 && d) g.fillText(`${d}`, w - 26, y + 4);
  }
  const mk = [G.cx + Math.sin(SECTOR * RAD) * G.scale * 2.2 + 8, G.cy + 4];
  g.fillStyle = '#F5C451'; g.beginPath(); g.arc(mk[0], mk[1], 4, 0, Math.PI * 2); g.fill();
  g.font = '700 12px "JetBrains Mono", monospace'; g.fillStyle = '#F5C451'; g.fillText(title, 10, 16);
  g.textAlign = 'right'; g.fillStyle = '#CFE3F2'; g.fillText(`HR ${HR} · ${depth} cm`, w - 10, 16);
  g.textAlign = 'left';
  ecg(g, w, h, phase);

  if (labels) {
    g.font = '800 12px Archivo, sans-serif'; g.textAlign = 'center';
    for (const [k, e] of Object.entries(cent)) {
      if (e[2] < 25) continue;
      const x = e[0] / e[2] * (w / rw), y = e[1] / e[2] * (w / rw);
      g.strokeStyle = 'rgba(0,0,0,0.85)'; g.lineWidth = 3; g.strokeText(SHORT[k], x, y);
      g.fillStyle = k === 'thrombus' ? '#E9D5FF' : '#FFE08A'; g.fillText(SHORT[k], x, y);
    }
    g.textAlign = 'left';
  }
  return G;
}

/** The same plane as a labelled, colour-coded drawing. Returns what it found. */
export function drawDiagram(g, w, h, state) {
  const { pose, depth, phase, rw = 170, title = '' } = state;
  g.fillStyle = '#071120'; g.fillRect(0, 0, w, h);
  const rh = Math.round(rw * h / w);
  const buf = buffer(rw, rh);
  const bg = buf.getContext('2d');
  const img = bg.createImageData(rw, rh);
  const D = img.data;
  const cent = {}, segc = {};
  const { G } = sweep(w, h, pose, depth, phase, rw, (i, j, tis) => {
    let c = DIAG[tis.k] || [60, 60, 60];
    if ((tis.k === 'myo' || tis.k === 'scar') && tis.seg != null) {
      c = MOTION_COL[MOTION[tis.seg]];
      const e = segc[tis.seg] || (segc[tis.seg] = [0, 0, 0]); e[0] += i; e[1] += j; e[2]++;
    }
    const o = (j * rw + i) * 4;
    D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = 255;
    if (SHORT[tis.k] || tis.k === 'valve' || tis.k === 'peri') { const e = cent[tis.k] || (cent[tis.k] = [0, 0, 0]); e[0] += i; e[1] += j; e[2]++; }
  });
  bg.putImageData(img, 0, 0);
  g.save(); sectorPath(g, G, depth); g.clip();
  g.imageSmoothingEnabled = false;
  g.drawImage(buf, 0, 0, w, h);
  g.restore();
  g.strokeStyle = 'rgba(148,180,214,0.45)'; g.lineWidth = 1.2; sectorPath(g, G, depth); g.stroke();

  const k = w / rw;
  const pill = (txt, x, y, col, bgc = 'rgba(5,11,22,0.85)') => {
    g.font = '800 12px Archivo, sans-serif';
    const tw = g.measureText(txt).width + 12;
    g.fillStyle = bgc; g.beginPath(); g.roundRect(x - tw / 2, y - 10, tw, 20, 7); g.fill();
    g.strokeStyle = col; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + 1);
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  };
  const names = { lvc: 'LV', rvc: 'RV', la: 'LA', ra: 'RA', ao: 'Aorta', dao: 'Desc. aorta', thrombus: '⚠️ Thrombus', liver: 'Liver' };
  for (const [kk, e] of Object.entries(cent)) {
    if (e[2] < 30 || !names[kk]) continue;
    pill(names[kk], e[0] / e[2] * k, e[1] / e[2] * k, kk === 'thrombus' ? '#E9D5FF' : '#E9F2FC');
  }
  const found = [];
  for (const [sg, e] of Object.entries(segc)) {
    if (e[2] < 12) continue;
    found.push(+sg);
    const m = MOTION[sg];
    pill(`${+sg + 1}`, e[0] / e[2] * k, e[1] / e[2] * k, `rgb(${MOTION_COL[m].join(',')})`);
  }
  g.font = '800 14px Archivo, sans-serif'; g.fillStyle = '#E9F2FC'; g.fillText(`🖼️ ${title} — illustrated`, 12, 18);
  return { segments: found.sort((a, b) => a - b), thrombus: !!cent.thrombus && cent.thrombus[2] >= 6 };
}

export { SEGMENTS, MOTION, MOTION_COL, sys };
