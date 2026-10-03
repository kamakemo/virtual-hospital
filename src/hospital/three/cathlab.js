import * as THREE from 'three';
import { MAT, box, rbox, cyl, sphere, plane, part, tube, bake, screenMat } from './kit.js';
import * as TX from './textures.js';
import { BED } from './bedFrame.js';
import { buildPatient } from './patient.js';
import { crashCart, apronRack, plant, wallMonitor, ivPole } from './props.js';

/* ============================================================
   CARDIAC CATHETERISATION LABORATORY
   Not a ward: one procedure room and its control room. The
   patient lies on the radiolucent table under sterile drapes,
   right arm out on the board for radial access. A C-arm wraps the
   chest (flat-panel detector above, tube below), the ceiling-hung
   monitor bank faces the operator across the table, the lead
   acrylic shield hangs between operator and patient, and the
   control room watches through lead glass.

   World axes: the table runs along z with the head at -z; the
   operator stands beside the table at +x.
   ============================================================ */

const ROOM = { x0: -5, x1: 5, z0: -6, z1: 6, H: 3.2 };
const CTRL = { x1: 8.6, z0: -6, z1: 3.1 };
const TABLE = { y: 0.95, head: -2.45, foot: 0.75, w: 0.66 };
const ISO = new THREE.Vector3(0, 1.18, -1.8);       // the C-arm's isocentre, over the heart

/* ---------- the angiography wall: six screens in one frame ---------- */

function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** A coronary angiogram: grey chest on fluoroscopic grain, ribs, a dark contrast-filled tree. */
function angiogram(w, h, seed, { lesion = false } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const r = seeded(seed);
  const bg = g.createRadialGradient(w * 0.5, h * 0.48, h * 0.1, w * 0.5, h * 0.5, w * 0.62);
  bg.addColorStop(0, '#C9C9C6'); bg.addColorStop(0.65, '#9A9A97'); bg.addColorStop(1, '#3B3B3A');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // heart shadow, diaphragm, ribs
  g.fillStyle = 'rgba(40,40,40,0.16)';
  g.beginPath(); g.ellipse(w * 0.56, h * 0.6, w * 0.3, h * 0.36, -0.4, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = h * 0.035;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(w * 0.5, h * (0.05 + k * 0.22), w * 0.7, h * 0.16, 0.12, 0.1, Math.PI - 0.1); g.stroke(); }
  for (let i = 0; i < w * h * 0.05; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${r() * 0.08})`; g.fillRect(r() * w, r() * h, 1.6, 1.6); }
  // the tree
  g.lineCap = 'round'; g.lineJoin = 'round';
  const branch = (x, y, ang, len, wid, depth) => {
    if (depth <= 0 || wid < 0.6) return;
    const segs = 6;
    let px = x, py = y, a = ang;
    const pts = [[px, py]];
    for (let i = 0; i < segs; i++) {
      a += (r() - 0.5) * 0.35;
      px += Math.cos(a) * len / segs; py += Math.sin(a) * len / segs;
      pts.push([px, py]);
    }
    g.strokeStyle = 'rgba(20,20,20,0.86)'; g.lineWidth = wid;
    g.beginPath(); pts.forEach(([u, v], i) => (i ? g.lineTo(u, v) : g.moveTo(u, v))); g.stroke();
    g.strokeStyle = 'rgba(20,20,20,0.25)'; g.lineWidth = wid * 1.8; g.stroke();
    const kids = depth > 2 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const t = 0.35 + r() * 0.6;
      const [bx, by] = pts[Math.min(segs, Math.round(t * segs))];
      branch(bx, by, a + (r() < 0.5 ? -1 : 1) * (0.35 + r() * 0.6), len * (0.45 + r() * 0.25), wid * 0.62, depth - 1);
    }
    branch(px, py, a + (r() - 0.5) * 0.3, len * 0.7, wid * 0.8, depth - 1);
  };
  const ox = w * (0.3 + r() * 0.12), oy = h * (0.22 + r() * 0.1);
  g.strokeStyle = 'rgba(70,70,70,0.9)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, h * 0.08); g.quadraticCurveTo(ox * 0.6, oy * 0.4, ox, oy); g.stroke();    // the guide catheter
  branch(ox, oy, 0.75 + r() * 0.3, h * 0.42, h * 0.03, 4);
  branch(ox, oy, 1.75 + r() * 0.3, h * 0.34, h * 0.025, 3);
  if (lesion) { g.fillStyle = 'rgba(175,175,172,0.95)'; g.beginPath(); g.ellipse(ox + h * 0.13, oy + h * 0.12, h * 0.012, h * 0.03, 0.8, 0, Math.PI * 2); g.fill(); }
  const vig = g.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.7);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.75)');
  g.fillStyle = vig; g.fillRect(0, 0, w, h);
  return c;
}

function labDisplay() {
  const W = 1536, H = 704, B = 10;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const tw = (W - B * 4) / 3, th = (H - B * 3) / 2;
  const T = (col, row) => [B + col * (tw + B), B + row * (th + B)];

  const live = angiogram(tw, th, 7, { lesion: true });
  const ref = angiogram(tw, th, 21, { lesion: true });
  const spider = angiogram(tw, th, 45);

  const ivus = document.createElement('canvas');
  ivus.width = 300; ivus.height = 300;
  const v = ivus.getContext('2d');
  v.fillStyle = '#000'; v.fillRect(0, 0, 300, 300);
  for (let i = 0; i < 26000; i++) {
    const a = Math.random() * Math.PI * 2, rr = Math.random() * 140;
    const b = rr > 50 && rr < 120 ? 0.5 * Math.random() : 0.12 * Math.random();
    v.fillStyle = `rgba(255,255,255,${b})`; v.fillRect(150 + Math.cos(a) * rr, 150 + Math.sin(a) * rr, 1.5, 1.5);
  }
  v.strokeStyle = 'rgba(255,255,255,0.95)'; v.lineWidth = 8;
  v.beginPath(); v.arc(150, 150, 78, -0.6, 2.6); v.stroke();
  v.fillStyle = '#000'; v.beginPath(); v.arc(150, 150, 42, 0, Math.PI * 2); v.fill();
  v.fillStyle = '#9AA'; v.beginPath(); v.arc(150, 150, 7, 0, Math.PI * 2); v.fill();

  const mono = (wt, px) => `${wt} ${px}px "JetBrains Mono", "IBM Plex Mono", monospace`;
  const waves = [
    { c: '#3BE07A', a: 0.34, fn: x => x < 0.05 ? 0 : x < 0.08 ? 1 : x < 0.11 ? -0.3 : x > 0.3 && x < 0.45 ? Math.sin((x - 0.3) / 0.15 * Math.PI) * 0.2 : 0 },
    { c: '#FF5A52', a: 0.5, fn: x => x < 0.18 ? Math.sin(x / 0.18 * Math.PI / 2) : x < 0.3 ? 1 - (x - 0.18) * 1.5 : x < 0.34 ? 0.82 + (x - 0.3) : Math.max(0, 0.86 - (x - 0.34) * 1.2) },
    { c: '#3ED0F5', a: 0.3, fn: x => x < 0.3 ? Math.sin(x / 0.3 * Math.PI / 2) : Math.max(0, 1 - (x - 0.3) * 1.4) },
    { c: '#F5D04A', a: 0.25, fn: x => Math.sin(x * Math.PI * 2) * 0.4 + 0.4 },
  ];

  let last = -1;
  function draw(t) {
    if (t - last < 0.066) return;                         // ~15 frames a second is plenty for a wall screen
    last = t;
    g.fillStyle = '#020304'; g.fillRect(0, 0, W, H);
    // row 1: live fluoro, reference cine, haemodynamic waveforms
    let [x, y] = T(0, 0);
    g.drawImage(live, x, y);
    g.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.035})`; g.fillRect(x, y, tw, th);
    g.fillStyle = '#FFB020'; g.font = mono(600, 17); g.fillText('LIVE   LAO 30  CRA 20', x + 14, y + 26);
    g.fillStyle = '#E8E8E8'; g.fillText('15 f/s  ●REC', x + tw - 140, y + 26);
    [x, y] = T(1, 0);
    g.drawImage(ref, x, y);
    g.fillStyle = '#FFB020'; g.fillText('REF   RAO 20  CRA 30', x + 14, y + 26);
    [x, y] = T(2, 0);
    g.fillStyle = '#05080B'; g.fillRect(x, y, tw, th);
    waves.forEach((wv, i) => {
      const yy = y + 50 + i * 80;
      g.strokeStyle = wv.c; g.lineWidth = 2.2; g.beginPath();
      for (let k = 0; k < tw - 130; k += 2) {
        const p = (t * 1.25 - (tw - 130 - k) / 160) % 1;
        const val = wv.fn(p < 0 ? p + 1 : p);
        k ? g.lineTo(x + 10 + k, yy - val * 80 * wv.a) : g.moveTo(x + 10, yy - val * 80 * wv.a);
      }
      g.stroke();
    });
    g.textAlign = 'right';
    g.fillStyle = '#3BE07A'; g.font = mono(700, 44); g.fillText('84', x + tw - 14, y + 58);
    g.fillStyle = '#FF5A52'; g.font = mono(700, 30); g.fillText('132/74', x + tw - 14, y + 136);
    g.fillStyle = '#3ED0F5'; g.font = mono(700, 38); g.fillText('97', x + tw - 14, y + 214);
    g.fillStyle = '#F5D04A'; g.font = mono(700, 30); g.fillText('16', x + tw - 14, y + 290);
    g.textAlign = 'left';
    // row 2: numbers, IVUS, a second projection
    [x, y] = T(0, 1);
    g.fillStyle = '#05080B'; g.fillRect(x, y, tw, th);
    const rows = [['HR', '84', '#3BE07A'], ['ART', '132/74', '#FF5A52'], ['SpO₂', '97', '#3ED0F5'], ['ACT', '268', '#F5D04A'], ['CONTRAST', '72 mL', '#E8E8E8'], ['AK', '412 mGy', '#E8E8E8']];
    rows.forEach(([k, val, col], i) => {
      const cx = x + 20 + (i % 2) * (tw / 2), cy = y + 60 + Math.floor(i / 2) * 104;
      g.fillStyle = '#7B8C99'; g.font = mono(500, 16); g.fillText(k, cx, cy - 22);
      g.fillStyle = col; g.font = mono(700, 40); g.fillText(val, cx, cy + 22);
    });
    [x, y] = T(1, 1);
    g.fillStyle = '#000'; g.fillRect(x, y, tw, th);
    g.drawImage(ivus, x + 20, y + 20, th - 40, th - 40);
    g.fillStyle = '#9FD3FF'; g.font = mono(600, 16);
    g.fillText('IVUS 60 MHz', x + th, y + 40); g.fillText('MLA 1.9 mm²', x + th, y + 70); g.fillText('Ca²⁺ 360°', x + th, y + 100);
    [x, y] = T(2, 1);
    g.drawImage(spider, x, y);
    g.fillStyle = '#FFB020'; g.font = mono(600, 17); g.fillText('LAO 45  CAU 30', x + 14, y + 26);
    tex.needsUpdate = true;
  }
  draw(0);
  return { texture: tex, draw, aspect: W / H };
}

/** The lab's list for the day, as shown on the wall screen. */
function scheduleBoard(floor) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 640;
  const g = c.getContext('2d');
  g.fillStyle = '#0D1A24'; g.fillRect(0, 0, 1024, 640);
  g.fillStyle = floor.hue; g.fillRect(0, 0, 1024, 64);
  g.fillStyle = '#FFF'; g.font = '700 30px Archivo, Arial, sans-serif';
  g.fillText('CATH LAB 1 · TODAY’S LIST', 28, 43);
  g.font = '500 20px Archivo, Arial, sans-serif'; g.textAlign = 'right';
  g.fillText('Operator: Interventional Cardiology', 996, 42); g.textAlign = 'left';
  floor.beds.forEach((h, i) => {
    const y = 96 + i * 44;
    g.fillStyle = i % 2 ? '#13232F' : '#0F1E29'; g.fillRect(16, y - 30, 992, 42);
    g.fillStyle = '#FFB020'; g.font = '600 20px "IBM Plex Mono", monospace';
    g.fillText(`${String(8 + Math.floor(i * 0.75)).padStart(2, '0')}:${i % 4 === 0 ? '00' : i % 4 === 1 ? '45' : i % 4 === 2 ? '30' : '15'}`, 28, y);
    g.fillStyle = '#E8F0F6'; g.font = '500 20px Archivo, Arial, sans-serif';
    let text = h || 'Slot available';
    while (g.measureText(text).width > 760 && text.length > 10) text = text.slice(0, -2);
    if (text !== (h || 'Slot available')) text += '…';
    g.fillText(`${String(i + 1).padStart(2, '0')}   ${text}`, 120, y);
    g.fillStyle = i === 0 ? '#38E07A' : '#5C7489'; g.font = '600 16px Archivo, Arial, sans-serif';
    g.textAlign = 'right'; g.fillText(i === 0 ? 'IN LAB' : 'WAITING', 996, y); g.textAlign = 'left';
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildCathLab(floor) {
  const root = new THREE.Group();
  const own = [];
  const W = ROOM.x1 - ROOM.x0, L = ROOM.z1 - ROOM.z0, H = ROOM.H;
  const surf = (tex, rx, ry, opts = {}) => {
    const t = tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true;
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, ...opts });
    own.push(t, m);
    return m;
  };
  const flat = (geo, mat, x, y, z, rx = -Math.PI / 2, ry = 0) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; root.add(m); return m;
  };
  const white = MAT.paint('#F4F5F4', 0.4);
  const band = MAT.paint('#A8BED0', 0.6);
  const hoseMat = ribbedHose(own);

  /* ---------- shell: white walls with a pale-blue band, glossy grey floor ---------- */
  flat(new THREE.PlaneGeometry(W, L), surf(TX.vinyl('#C9CED3'), 4, 5, { roughness: 0.3 }), 0, 0, 0);
  flat(new THREE.PlaneGeometry(CTRL.x1 - ROOM.x1, CTRL.z1 - CTRL.z0), surf(TX.vinyl('#BFC4C8'), 2, 3), (ROOM.x1 + CTRL.x1) / 2, 0, (CTRL.z0 + CTRL.z1) / 2);
  const wallMat = surf(TX.plaster('#E9ECEE'), 5, 1, { roughness: 0.9 });
  flat(new THREE.PlaneGeometry(L, H), wallMat, ROOM.x0, H / 2, 0, 0, Math.PI / 2);
  flat(new THREE.PlaneGeometry(W, H), wallMat, 0, H / 2, ROOM.z0, 0, 0);
  flat(new THREE.PlaneGeometry(W, H), wallMat, 0, H / 2, ROOM.z1, 0, Math.PI);
  flat(new THREE.PlaneGeometry(CTRL.x1 - ROOM.x1, H), wallMat, (ROOM.x1 + CTRL.x1) / 2, H / 2, CTRL.z0, 0, 0);
  flat(new THREE.PlaneGeometry(CTRL.z1 - CTRL.z0, H), wallMat, CTRL.x1, H / 2, (CTRL.z0 + CTRL.z1) / 2, 0, -Math.PI / 2);
  flat(new THREE.PlaneGeometry(CTRL.x1 - ROOM.x1, H), wallMat, (ROOM.x1 + CTRL.x1) / 2, H / 2, CTRL.z1, 0, Math.PI);
  flat(new THREE.PlaneGeometry(W + 4, L), surf(TX.ceilingTiles(), (W + 4) / 0.6, L / 0.6, { roughness: 0.95 }), 1.8, H, 0, Math.PI / 2);

  const shell = new THREE.Group();
  // the pale-blue wall band with panel seams, a bumper rail and skirting
  const BAND = { y0: 1.95, y1: 2.35 };
  const bh = BAND.y1 - BAND.y0, by = (BAND.y0 + BAND.y1) / 2;
  shell.add(part(box(0.02, bh, L), band, ROOM.x0 + 0.01, by, 0));
  shell.add(part(box(W, bh, 0.02), band, 0, by, ROOM.z0 + 0.01));
  shell.add(part(box(W - 2.1, bh, 0.02), band, 1.05, by, ROOM.z1 - 0.01));
  for (let z = ROOM.z0 + 1.2; z < ROOM.z1; z += 1.2) shell.add(part(box(0.025, bh, 0.012), MAT.paint('#E3EDF5', 0.6), ROOM.x0 + 0.012, by, z));
  for (let x = ROOM.x0 + 1.2; x < ROOM.x1; x += 1.2) shell.add(part(box(0.012, bh, 0.025), MAT.paint('#E3EDF5', 0.6), x, by, ROOM.z0 + 0.012));
  for (const [x, z, w, d] of [[ROOM.x0 + 0.02, 0, 0.04, L], [0, ROOM.z0 + 0.02, W, 0.04], [0, ROOM.z1 - 0.02, W, 0.04]]) {
    shell.add(part(box(w, 0.1, d), MAT.paint('#9AA3AA', 0.5), x, 0.05, z));
    shell.add(part(box(Math.max(w, 0.06), 0.1, Math.max(d, 0.06)), white, x, 0.98, z));
  }
  // the lab / control-room partition: a long lead-glass window and a door
  const xw = ROOM.x1;
  const WIN = { y0: 1.0, y1: 2.35, z0: -6, z1: 1.4 };
  const wl = WIN.z1 - WIN.z0, wz = (WIN.z0 + WIN.z1) / 2;
  shell.add(part(box(0.18, WIN.y0, wl), wallMat, xw, WIN.y0 / 2, wz));
  shell.add(part(box(0.18, H - WIN.y1, wl), wallMat, xw, WIN.y1 + (H - WIN.y1) / 2, wz));
  shell.add(part(box(0.18, H, 3.2), wallMat, xw, H / 2, 4.4));
  shell.add(part(box(0.18, 0.85, 1.4), wallMat, xw, H - 0.425, 2.1));
  for (const z of [WIN.z0 + 0.04, -3.5, -1.0, WIN.z1 - 0.04]) shell.add(part(box(0.22, WIN.y1 - WIN.y0, 0.08), MAT.lightGrey(), xw, (WIN.y0 + WIN.y1) / 2, z));
  for (const y of [WIN.y0, WIN.y1]) shell.add(part(box(0.24, 0.08, wl), MAT.lightGrey(), xw, y, wz));
  // entrance: lead-lined sliding door, X-ray warning light over it
  shell.add(part(rbox(1.6, 2.25, 0.08, 0.02), MAT.paint('#DCE3E8', 0.45), -2.6, 1.125, ROOM.z1 - 0.06));
  shell.add(part(box(0.38, 0.55, 0.02), MAT.glassClear(), -2.6, 1.55, ROOM.z1 - 0.11));
  shell.add(part(rbox(0.04, 0.55, 0.05, 0.01), MAT.chrome(), -1.98, 1.05, ROOM.z1 - 0.12));
  // back wall: double doors to the store
  shell.add(part(rbox(1.7, 2.3, 0.06, 0.02), MAT.paint('#DCE3E8', 0.45), 2.6, 1.15, ROOM.z0 + 0.04));
  shell.add(part(box(0.02, 2.2, 0.07), MAT.lightGrey(), 2.6, 1.12, ROOM.z0 + 0.05));
  for (const dx of [-0.4, 0.4]) shell.add(part(box(0.3, 0.5, 0.02), MAT.glassClear(), 2.6 + dx, 1.6, ROOM.z0 + 0.08));
  root.add(bake(shell));

  const leadGlass = new THREE.MeshPhysicalMaterial({ color: '#E6EEF2', roughness: 0.03, transmission: 0.92, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
  own.push(leadGlass);
  flat(new THREE.PlaneGeometry(wl, WIN.y1 - WIN.y0), leadGlass, xw, (WIN.y0 + WIN.y1) / 2, wz, 0, Math.PI / 2);

  const warn = new THREE.MeshStandardMaterial({ color: '#500', emissive: '#FF3B2F', emissiveIntensity: 2.4 });
  own.push(warn);
  root.add(part(rbox(0.8, 0.18, 0.06, 0.02), warn, -2.6, 2.5, ROOM.z1 - 0.04));
  signPanel(root, own, 'X-RAY IN USE', '#B3261E', -2.6, 2.5, ROOM.z1 - 0.075, Math.PI, 0.74, 0.16, 0.9);
  signPanel(root, own, 'CARDIAC CATH LAB 1', '#2F6C9E', -0.4, 2.55, ROOM.z0 + 0.03, 0, 1.7, 0.26, 0.3);

  /* ---------- ceiling: square LED panels and the gantry rails everything hangs from ---------- */
  const ceil = new THREE.Group();
  for (const x of [-3.9, -2.7, 0, 2.7, 3.9]) for (const z of [-4.8, -2.6, -0.4, 1.8, 4.2]) {
    if (Math.abs(x) < 0.1 && z < -2) continue;
    ceil.add(part(box(0.52, 0.02, 1.1), MAT.lightPanel(), x, H - 0.045, z));
    ceil.add(part(box(0.6, 0.025, 1.18), white, x, H - 0.006, z));
  }
  for (const [x, z] of [[6.8, -4], [6.8, -1]]) ceil.add(part(box(1.2, 0.02, 0.6), MAT.lightPanel(), x, H - 0.012, z));
  // Ventilation grilles between the light panels.
  for (const x of [-3, 3]) for (const z of [-3.5, 1]) {
    ceil.add(part(box(0.72, 0.025, 0.46), MAT.lightGrey(), x, H - 0.028, z));
    for (let k = 0; k < 10; k++) ceil.add(part(box(0.62, 0.012, 0.018), MAT.paint('#7F8A93', 0.7), x, H - 0.045, z - 0.18 + k * 0.04));
  }
  const RAIL = { x: [-1.7, 1.7], y: H - 0.12 };
  for (const x of RAIL.x) {
    ceil.add(part(rbox(0.24, 0.16, 9.2, 0.02), white, x, RAIL.y, -0.8));
    ceil.add(part(box(0.06, 0.03, 9.2), MAT.lightGrey(), x, RAIL.y - 0.09, -0.8));
    for (const z of [-5, -2.2, 0.6, 3.4]) ceil.add(part(box(0.08, 0.06, 0.08), MAT.lightGrey(), x, H - 0.03, z));
  }
  for (const z of [-4.4, -0.9, 2.6]) ceil.add(part(rbox(3.64, 0.14, 0.22, 0.02), white, 0, RAIL.y - 0.02, z));
  root.add(bake(ceil, { castShadow: false }));

  /* ---------- the table: dark pad and white sheet on a ribbed black pedestal ---------- */
  const tbl = new THREE.Group();
  const tLen = TABLE.foot - TABLE.head + 0.5, tMid = (TABLE.foot + 0.5 + TABLE.head) / 2;
  tbl.add(part(rbox(TABLE.w, 0.05, tLen, 0.02), MAT.paint('#30373D', 0.4), 0, TABLE.y, tMid));
  tbl.add(part(rbox(TABLE.w - 0.02, 0.035, tLen - 0.05, 0.015), MAT.paint('#3D454C', 0.75), 0, TABLE.y + 0.04, tMid));
  tbl.add(part(rbox(TABLE.w + 0.02, 0.012, tLen - 0.5, 0.004), MAT.linen(), 0, TABLE.y + 0.06, tMid - 0.15));
  for (const s of [-1, 1]) tbl.add(part(box(0.025, 0.03, tLen * 0.8), MAT.chrome(), s * (TABLE.w / 2 + 0.025), TABLE.y - 0.01, tMid + 0.2));
  const PZ = 0.55;
  tbl.add(part(rbox(1.0, 0.06, 1.45, 0.02), MAT.steel(), 0, 0.03, PZ));
  tbl.add(part(rbox(0.66, 0.62, 1.0, 0.03), MAT.paint('#1F2427', 0.6), 0, 0.37, PZ));
  for (let k = 0; k < 11; k++) tbl.add(part(box(0.68, 0.014, 1.02), MAT.paint('#33393E', 0.5), 0, 0.12 + k * 0.05, PZ));
  tbl.add(part(rbox(0.76, 0.2, 1.15, 0.04), white, 0, 0.78, PZ));
  tbl.add(part(rbox(0.5, 0.06, 0.8, 0.02), MAT.lightGrey(), 0, TABLE.y - 0.06, PZ));
  // table-side controls and the lead skirt, on the operator's side (+x)
  tbl.add(part(rbox(0.06, 0.16, 0.5, 0.02), MAT.charcoal(), TABLE.w / 2 + 0.07, TABLE.y - 0.06, 0.1));
  for (const dz of [-0.15, 0, 0.15]) tbl.add(part(cyl(0.012, 0.016, 0.07, 10), MAT.charcoal(), TABLE.w / 2 + 0.11, TABLE.y + 0.02, 0.1 + dz));
  tbl.add(part(rbox(0.02, 0.8, 1.9, 0.01), MAT.paint('#3D4852', 0.85), TABLE.w / 2 + 0.04, TABLE.y - 0.45, -0.95));
  for (let k = 0; k < 9; k++) tbl.add(part(box(0.022, 0.78, 0.008), MAT.paint('#2E3740', 0.85), TABLE.w / 2 + 0.045, TABLE.y - 0.45, -1.85 + k * 0.22));
  tbl.add(part(rbox(0.32, 0.05, 0.36, 0.025), MAT.paint('#3D454C', 0.8), 0, TABLE.y + 0.07, TABLE.head + 0.25));
  // cables and hoses spilling from the pedestal
  for (const [dx, dz, ex, ez, r] of [[-0.2, 0.2, -0.6, 1.5, 0.028], [0.15, 0.25, 0.7, 1.4, 0.024], [-0.1, -0.1, -0.9, -0.6, 0.03]]) {
    tbl.add(new THREE.Mesh(tube([[dx, 0.7, PZ + dz], [dx * 2, 0.25, PZ + dz * 2], [ex * 0.7, 0.04, PZ + (ez - PZ) * 0.6], [ex, 0.03, ez]], r, 40), hoseMat));
  }
  for (const dx of [-0.19, 0.19]) {
    tbl.add(part(rbox(0.15, 0.045, 0.28, 0.02), MAT.charcoal(), 0.65 + dx, 0.045, 0.65));
    tbl.add(part(rbox(0.1, 0.02, 0.16, 0.01), MAT.paint('#718797', 0.65), 0.65 + dx, 0.075, 0.63));
  }
  tbl.add(new THREE.Mesh(tube([[0.65, 0.04, 0.5], [0.7, 0.03, 0.2], [0.4, 0.04, 0], [0.3, 0.35, 0.4]], 0.012, 24), MAT.charcoal()));
  root.add(bake(tbl));

  /* ---------- the patient, draped, right arm out for radial access ---------- */
  const g = new THREE.Group();
  const headGroup = new THREE.Group();
  headGroup.position.set(BED.hingeX, BED.deckY, 0);
  g.add(headGroup);
  buildPatient(g, headGroup, 0, 'cathlab', { seed: 0x9e3779b1 >>> 0, cap: true, support: 'none', table: true });
  g.rotation.y = -Math.PI / 2;
  g.position.set(0, TABLE.y + 0.06 - (BED.deckY + BED.mattressT), TABLE.head - 0.05);
  root.add(bake(g));

  /* ---------- the C-arm: ceiling-mounted, wrapped around the chest from the left ---------- */
  const carm = new THREE.Group();
  carm.position.copy(ISO);
  const C = new THREE.Group();
  C.rotation.set(0, 0, 0);
  const R = 1.02;
  // A broad, flat gantry housing, with a recessed track along its outer edge.
  // Both ends meet the detector/tube on the vertical beam axis.
  const ring = (inner, outer, depth, material) => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outer, Math.PI / 2, Math.PI * 1.5, false);
    shape.absarc(0, 0, inner, Math.PI * 1.5, Math.PI / 2, true);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth, steps: 1, curveSegments: 48,
      bevelEnabled: true, bevelSegments: 2, bevelSize: 0.025, bevelThickness: 0.025,
    });
    geometry.translate(0, 0, -depth / 2);
    C.add(new THREE.Mesh(geometry, material));
    own.push(geometry);
  };
  ring(R - 0.13, R + 0.16, 0.42, MAT.plastic());
  ring(R + 0.025, R + 0.075, 0.475, MAT.lightGrey());
  C.add(part(rbox(0.34, 0.34, 0.44, 0.04), MAT.plastic(), 0, R - 0.15, 0));
  C.add(part(rbox(0.34, 0.28, 0.44, 0.04), MAT.plastic(), 0, -R + 0.17, 0));
  C.add(part(rbox(0.66, 0.2, 0.66, 0.05), MAT.plastic(), 0, R - 0.36, 0));               // flat-panel detector
  C.add(part(rbox(0.56, 0.025, 0.56, 0.01), MAT.charcoal(), 0, R - 0.47, 0));
  C.add(part(rbox(0.46, 0.34, 0.5, 0.07), MAT.plastic(), 0, -(R - 0.3), 0));            // tube housing
  C.add(part(rbox(0.36, 0.08, 0.4, 0.03), MAT.lightGrey(), 0, -(R - 0.52), 0));
  C.add(part(rbox(0.3, 0.42, 0.5, 0.05), MAT.lightGrey(), -R - 0.14, 0, 0));               // carriage on the C's back
  // corrugated cable hoses running round the outside of the C to the tube
  for (const dz of [-0.13, 0.13]) {
    const pts = [];
    for (let k = 0; k <= 8; k++) { const th = THREE.MathUtils.degToRad(95 + k * 20); pts.push([(R + 0.2) * Math.cos(th), (R + 0.2) * Math.sin(th), dz]); }
    pts.push([0, -(R - 0.22), dz]);
    C.add(new THREE.Mesh(tube(pts, 0.04, 60), hoseMat));
  }
  carm.add(C);
  C.updateMatrix();
  const back = new THREE.Vector3(-R - 0.3, 0, 0).applyMatrix4(C.matrix);              // the carriage, in carm space
  // L-arm: elbow from the carriage, column up to its carriage on the left ceiling rail
  const colX = back.x - 0.35, colTop = H - ISO.y - 0.2;
  carm.add(part(rbox(0.5, 0.26, 0.42, 0.05), MAT.plastic(), (back.x + colX) / 2, back.y, back.z));
  carm.add(part(rbox(0.44, colTop - back.y, 0.5, 0.06), MAT.plastic(), colX, (colTop + back.y) / 2, back.z));
  carm.add(part(rbox(0.7, 0.3, 0.9, 0.06), MAT.plastic(), RAIL.x[0] - ISO.x, colTop + 0.05, back.z));
  carm.add(part(rbox(0.04, 0.2, 0.4, 0.01), MAT.charcoal(), colX + 0.225, back.y + 0.5, back.z));
  carm.add(new THREE.Mesh(tube([[colX - 0.15, colTop, back.z - 0.2], [colX - 0.35, colTop - 0.5, back.z - 0.3], [back.x - 0.1, back.y + 0.1, back.z - 0.3], [back.x, back.y - 0.1, back.z - 0.2]], 0.045, 40), hoseMat));
  root.add(bake(carm));

  /* ---------- the angiography wall on its ceiling boom, facing the operator ---------- */
  const live = labDisplay();
  own.push(live.texture);
  const MW = 2.5, MH = MW / live.aspect;
  const boom = new THREE.Group();
  const screens = new THREE.Group();
  screens.position.set(1.45, 2.12, -2.5);
  screens.rotation.y = -0.2;
  screens.add(part(rbox(MW + 0.1, MH + 0.1, 0.09, 0.02), MAT.charcoal(), 0, 0, 0));
  // Thin individual bezels preserve the six-panel layout even at an angle.
  for (const dx of [-MW / 6, MW / 6]) screens.add(part(box(0.018, MH, 0.012), MAT.charcoal(), dx, 0, 0.06));
  screens.add(part(box(MW, 0.018, 0.012), MAT.charcoal(), 0, 0, 0.06));
  const big = part(plane(MW, MH), screenMat(live.texture, 1.0), 0, 0, 0.05);
  big.userData.keep = true;
  screens.add(big);
  screens.add(part(rbox(MW + 0.3, 0.07, 0.07, 0.02), MAT.steel(), 0, MH / 2 + 0.12, -0.05));
  screens.add(part(rbox(MW + 0.6, 0.06, 0.06, 0.02), MAT.steel(), 0, -MH / 2 - 0.18, 0.15));
  for (const dx of [-MW / 2 - 0.25, MW / 2 + 0.25]) screens.add(part(cyl(0.025, 0.025, 0.35, 8), MAT.steel(), dx, -MH / 2 - 0.02, 0.15));
  boom.add(screens);
  screens.updateMatrixWorld();
  const hang = new THREE.Vector3(0, MH / 2 + 0.12, -0.05).applyMatrix4(screens.matrix);
  boom.add(part(cyl(0.05, 0.05, H - hang.y - 0.1, 12), MAT.plastic(), hang.x, (H + hang.y) / 2 - 0.05, hang.z));
  boom.add(part(rbox(0.3, 0.12, 0.3, 0.03), MAT.plastic(), hang.x, H - 0.1, hang.z));
  root.add(bake(boom));

  /* ---------- lead acrylic shield, ceiling-suspended between operator and tube ---------- */
  const shieldArm = new THREE.Group();
  const SH = { x: 0.95, y: 1.65, z: -0.95 };
  shieldArm.add(part(cyl(0.035, 0.035, H - 2.35, 10), MAT.plastic(), RAIL.x[1], (H + 2.35) / 2, SH.z));
  shieldArm.add(part(rbox(RAIL.x[1] - SH.x, 0.06, 0.06, 0.02), MAT.plastic(), (RAIL.x[1] + SH.x) / 2, 2.35, SH.z));
  shieldArm.add(part(cyl(0.025, 0.025, 0.28, 10), MAT.steel(), SH.x, 2.2, SH.z));
  // the frame
  const fw = 1.05, fh = 0.98;
  for (const dz of [-fw / 2, fw / 2]) shieldArm.add(part(cyl(0.012, 0.012, fh, 8), MAT.steel(), SH.x, SH.y, SH.z + dz));
  for (const dy of [-fh / 2, fh / 2]) shieldArm.add(part(cyl(0.012, 0.012, fw, 8), MAT.steel(), SH.x, SH.y + dy, SH.z, Math.PI / 2, 0, 0));
  for (let k = 0; k < 8; k++) shieldArm.add(part(box(0.012, 0.24, 0.08), MAT.paint('#3D4852', 0.85), SH.x, SH.y - fh / 2 - 0.12, SH.z - 0.3 + k * 0.085));
  root.add(bake(shieldArm));
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.018, fh, fw), new THREE.MeshPhysicalMaterial({ color: '#EEF3F2', roughness: 0.04, transmission: 0.9, transparent: true, opacity: 0.25, depthWrite: false }));
  own.push(shield.material);
  shield.position.set(SH.x, SH.y, SH.z);
  root.add(shield);

  /* ---------- around the table ---------- */
  const kit = new THREE.Group();
  // contrast injector at the head
  kit.add(part(cyl(0.035, 0.035, 1.1, 10), MAT.plastic(), -0.85, 0.6, -2.95));
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; kit.add(part(box(0.32, 0.03, 0.05), MAT.lightGrey(), -0.85 + Math.cos(a) * 0.16, 0.06, -2.95 + Math.sin(a) * 0.16, 0, -a, 0)); }
  kit.add(part(rbox(0.22, 0.18, 0.34, 0.03), MAT.plastic(), -0.85, 1.2, -2.9));
  kit.add(part(cyl(0.045, 0.045, 0.24, 14), MAT.glassClear(), -0.85, 1.12, -2.67, Math.PI / 2, 0, 0));
  // the injector's touchscreen pedestal beside the table, as in every modern lab
  kit.add(part(cyl(0.03, 0.03, 1.0, 10), MAT.plastic(), 1.15, 0.55, -2.25));
  kit.add(part(rbox(0.5, 0.05, 0.5, 0.02), MAT.lightGrey(), 1.15, 0.03, -2.25));
  const tsGroup = new THREE.Group();
  tsGroup.position.set(1.15, 1.15, -2.25); tsGroup.rotation.set(0, 0.7, 0);
  tsGroup.add(part(rbox(0.46, 0.34, 0.06, 0.03), MAT.plastic(), 0, 0, 0));
  tsGroup.add(part(plane(0.38, 0.26), screenMat(TX.workstationScreen(), 0.85), 0, 0, 0.032));
  kit.add(tsGroup);
  // IVUS console and IABP on the far side
  kit.add(cart(-3.8, 0.6, '#E8EAEC', screenMat(TX.workstationScreen(), 0.8)));
  const iabp = TX.liveMonitor(2);
  own.push(iabp.texture);
  kit.add(cart(-2.2, -3.6, '#E8EAEC', screenMat(iabp.texture, 0.9), true));

  // the sterile back table: blue drape, blue trays, steel bowls, gauze, syringes, wire hoops
  kit.add(sterileTrolley(own, 2.25, 1.3, 1.65, 0.78, true, -0.15));
  // a second, smaller draped trolley and supply carts along the left wall
  kit.add(sterileTrolley(own, -4.25, 3.0, 0.9, 0.6, false, Math.PI / 2));
  kit.add(sterileTrolley(own, -4.3, 1.3, 0.9, 0.6, false, Math.PI / 2));

  // red-drawer emergency trolley with its defibrillator, far right
  kit.add(crashCart({ x: 4.3, z: 3.6, ry: Math.PI }));
  const defib = TX.liveMonitor(1);
  own.push(defib.texture);
  const dGroup = new THREE.Group();
  dGroup.position.set(4.3, 1.32, 3.6); dGroup.rotation.y = -Math.PI / 2;
  dGroup.add(part(rbox(0.42, 0.3, 0.16, 0.03), MAT.paint('#EDEDE8', 0.45), 0, 0, 0));
  dGroup.add(part(plane(0.3, 0.2), screenMat(defib.texture, 0.9), 0, 0.02, 0.081));
  kit.add(dGroup);

  // left wall: medical gas rail, monitors on arms, IV poles, a monitoring cart
  kit.add(part(rbox(0.1, 0.24, 4.6, 0.02), MAT.lightGrey(), ROOM.x0 + 0.06, 1.5, -1.0));
  for (let k = 0; k < 10; k++) {
    const col = ['#2E9B4E', '#E8C33A', '#222', '#3B6FC2', '#F2F2F2'][k % 5];
    kit.add(part(cyl(0.025, 0.025, 0.03, 12), MAT.paint(col, 0.4), ROOM.x0 + 0.12, 1.5, -3.1 + k * 0.42, 0, 0, Math.PI / 2));
  }
  for (const [z, v] of [[-2.4, 0], [-0.2, 3]]) {
    const lm = TX.liveMonitor(v); own.push(lm.texture);
    const m = wallMonitor(lm.texture, true); m.position.set(ROOM.x0, 0, z); kit.add(m);
  }
  kit.add(ivPole({ x: -4.3, z: -1.3, pumps: 2 }));
  kit.add(ivPole({ x: -4.0, z: 0.2, pumps: 1 }));
  const mon = TX.liveMonitor(0); own.push(mon.texture);
  const mc = new THREE.Group(); mc.add(cart(0, 0, '#E8EAEC', screenMat(mon.texture, 0.9))); mc.position.set(-4.25, 0, -3.4); mc.rotation.y = Math.PI; kit.add(mc);

  // supply cabinets along the back wall, glass-fronted
  for (let k = 0; k < 3; k++) {
    const x = -4.35 + k * 1.2;
    kit.add(part(rbox(1.15, 2.1, 0.5, 0.02), MAT.laminate(), x, 1.05, ROOM.z0 + 0.27));
    kit.add(part(box(1.0, 1.4, 0.02), MAT.glassClear(), x, 1.3, ROOM.z0 + 0.53));
    for (let sh = 0; sh < 4; sh++) for (let b = 0; b < 4; b++) kit.add(part(box(0.2, 0.12, 0.3), MAT.paint(['#E6E1D5', '#C8D6E4', '#F2F2EE', '#D9E6D6'][(sh + b) % 4], 0.8), x - 0.38 + b * 0.25, 0.8 + sh * 0.33, ROOM.z0 + 0.3));
  }
  kit.add(apronRack({ x: ROOM.x0 + 0.04, z: 4.4, ry: 0 }));
  // control room: desk, displays, chairs
  kit.add(part(rbox(0.8, 0.05, 6.6, 0.02), MAT.laminate(), 5.75, 0.76, -2.5));
  for (let k = 0; k < 4; k++) {
    const z = -5.0 + k * 1.6;
    kit.add(part(rbox(0.05, 0.42, 0.68, 0.02), MAT.charcoal(), 5.55, 1.08, z));
    kit.add(part(plane(0.64, 0.38), screenMat(k === 1 ? live.texture : TX.workstationScreen(), 0.9), 5.52, 1.08, z, 0, -Math.PI / 2, 0));
    kit.add(part(rbox(0.46, 0.08, 0.46, 0.03), MAT.charcoal(), 6.5, 0.5, z + 0.3));
    kit.add(part(rbox(0.07, 0.44, 0.42, 0.03), MAT.charcoal(), 6.75, 0.82, z + 0.3));
  }
  kit.add(plant({ x: 8.2, z: 0.8, h: 1.3 }));
  root.add(bake(kit));

  /* ---------- the day's list on the wall screen, inside the entrance ---------- */
  const listTex = scheduleBoard(floor);
  const listMat = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#FFF', emissiveMap: listTex, emissiveIntensity: 0.95, roughness: 0.4 });
  own.push(listTex, listMat);
  root.add(part(rbox(0.06, 0.9, 1.45, 0.02), MAT.charcoal(), ROOM.x0 + 0.04, 2.35, 2.2));
  root.add(part(plane(1.37, 0.86), listMat, ROOM.x0 + 0.075, 2.35, 2.2, 0, Math.PI / 2, 0));

  /* ---------- light: bright, even, clinical ---------- */
  root.add(new THREE.HemisphereLight('#F2F6FB', '#A8B2BD', 0.65));
  const key = new THREE.DirectionalLight('#F8FBFF', 1.25);
  key.position.set(-3, 7, 3);
  key.target.position.set(0, 0, -1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  root.add(key, key.target);
  const fill = new THREE.PointLight('#FFFFFF', 3, 7, 1.8);
  fill.position.set(0.4, H - 0.4, 0.8);
  root.add(fill);

  /* ---------- the twelve list slots: all lead to the table ---------- */
  const cam = { pos: new THREE.Vector3(1.55, 1.68, 0.95), target: new THREE.Vector3(-0.35, 1.12, -1.65) };
  const beds = floor.beds.map((h, i) => ({
    index: i, number: i + 1, header: h, occupied: !!h, side: -1,
    hit: null, glow: null, label: null,
    cam,
  }));

  return {
    group: root,
    beds,
    listMode: true,
    exposure: 1.08,
    shadowLight: key,
    entry: { pos: new THREE.Vector3(-2.85, 1.8, 3.65), target: new THREE.Vector3(0.15, 1.15, -1.15) },
    views: {
      overview: { pos: new THREE.Vector3(-2.85, 1.8, 3.65), target: new THREE.Vector3(0.15, 1.15, -1.15) },
      operator: { pos: new THREE.Vector3(2.6, 1.7, 0.45), target: new THREE.Vector3(0, 1.25, -1.8) },
      monitors: { pos: new THREE.Vector3(1.8, 1.75, 0.4), target: new THREE.Vector3(1.45, 2.12, -2.5) },
    },
    update(t) { live.draw(t); },
    dispose() {
      root.traverse(o => { if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose(); });
      own.forEach(x => x.dispose && x.dispose());
    },
  };
}

/** Grey corrugated hose: a ribbed texture repeated along the tube. */
function ribbedHose(own) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 8;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 64, 0);
  gr.addColorStop(0, '#8E959B'); gr.addColorStop(0.5, '#C9CED2'); gr.addColorStop(1, '#8E959B');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 8);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(70, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 });
  own.push(tex, m);
  return m;
}

/** A two-tier stainless trolley under a blue sterile drape, laid out for the case. */
function sterileTrolley(own, x, z, len, dep, laidOut, ry = 0) {
  const outer = new THREE.Group();
  const g = new THREE.Group();
  const top = 0.92, blue = MAT.paint('#72ACD6', 0.96), tray = MAT.paint('#2C6FD6', 0.35);
  g.add(part(rbox(len, 0.03, dep, 0.01), MAT.chrome(), 0, top, 0));
  g.add(part(rbox(len, 0.025, dep, 0.01), MAT.chrome(), 0, 0.3, 0));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    g.add(part(cyl(0.015, 0.015, top - 0.06, 8), MAT.chrome(), dx * (len / 2 - 0.03), top / 2, dz * (dep / 2 - 0.03)));
    g.add(part(cyl(0.035, 0.035, 0.03, 12), MAT.castor(), dx * (len / 2 - 0.03), 0.035, dz * (dep / 2 - 0.03), Math.PI / 2, 0, 0));
  }
  g.add(part(rbox(len + 0.06, 0.012, dep + 0.06, 0.004), blue, 0, top + 0.022, 0));
  const skirt = (width, x, z, rotation) => {
    const geo = new THREE.PlaneGeometry(width, 0.36, 32, 6);
    own.push(geo);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i), drop = (0.18 - pos.getY(i)) / 0.36;
      pos.setZ(i, Math.sin(u * 38) * 0.012 * drop);
      pos.setY(i, pos.getY(i) + Math.sin(u * 17) * 0.008 * drop);
    }
    geo.computeVertexNormals();
    const cloth = new THREE.Mesh(geo, blue);
    cloth.position.set(x, top - 0.15, z); cloth.rotation.y = rotation;
    g.add(cloth);
  };
  skirt(len + 0.06, 0, dep / 2 + 0.035, 0);
  skirt(len + 0.06, 0, -dep / 2 - 0.035, Math.PI);
  skirt(dep + 0.06, len / 2 + 0.035, 0, Math.PI / 2);
  skirt(dep + 0.06, -len / 2 - 0.035, 0, -Math.PI / 2);
  g.add(part(rbox(len * 0.6, 0.08, dep * 0.6, 0.01), MAT.steel(), 0, 0.36, 0));
  const y = top + 0.03;
  if (laidOut) {
    for (let k = 0; k < 3; k++) g.add(part(rbox(0.18, 0.05, 0.13, 0.015), tray, -len / 2 + 0.16 + k * 0.21, y + 0.025, -dep / 2 + 0.12));
    for (const [dx, r] of [[len / 2 - 0.28, 0.09], [len / 2 - 0.12, 0.07]]) g.add(part(cyl(r, r * 0.75, 0.06, 22), MAT.chrome(), dx, y + 0.03, -dep / 2 + 0.16));
    for (let k = 0; k < 3; k++) g.add(part(rbox(0.13, 0.035 + k * 0.01, 0.11, 0.01), MAT.linen(), len / 2 - 0.12 - k * 0.15, y + 0.02, dep / 2 - 0.12));
    for (let k = 0; k < 6; k++) g.add(part(cyl(0.008, 0.008, 0.4 - k * 0.03, 8), k % 2 ? MAT.glassClear() : MAT.plastic(), -0.1 + k * 0.035, y + 0.01, 0.04, Math.PI / 2, 0, 0.35));
    g.add(part(rbox(0.07, 0.035, 0.035, 0.01), MAT.plastic(), -len / 2 + 0.3, y + 0.02, 0.12));
    for (const dz of [0.0, 0.16]) { const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.008, 6, 28), MAT.paint('#2E5E8E', 0.5)); hoop.rotation.x = Math.PI / 2; hoop.position.set(-len / 2 + 0.2, y + 0.01, dz); g.add(hoop); }
  } else {
    g.add(part(rbox(len * 0.7, 0.06, dep * 0.6, 0.02), MAT.linen(), 0, y + 0.03, 0));
    g.add(part(rbox(0.16, 0.05, 0.12, 0.015), tray, len / 2 - 0.15, y + 0.06, 0));
  }
  g.rotation.y = ry;
  g.position.set(x, 0, z);
  outer.add(g);
  return outer;
}

/** A console cart: castors, body, an angled display on top. */
function cart(x, z, color, screen, cylinder = false) {
  const g = new THREE.Group();
  g.add(part(rbox(0.55, 0.85, 0.55, 0.04), MAT.paint(color, 0.45), x, 0.5, z));
  for (const dx of [-0.22, 0.22]) for (const dz of [-0.22, 0.22]) g.add(part(cyl(0.035, 0.035, 0.03, 10), MAT.castor(), x + dx, 0.04, z + dz, Math.PI / 2, 0, 0));
  g.add(part(rbox(0.05, 0.36, 0.5, 0.02), MAT.charcoal(), x - 0.1, 1.15, z, 0, 0, -0.2));
  g.add(part(plane(0.46, 0.3), screen, x - 0.135, 1.15, z, 0, -Math.PI / 2, 0.2));
  if (cylinder) g.add(part(cyl(0.07, 0.07, 0.75, 14), MAT.paint('#8C9AA6', 0.4), x + 0.32, 0.45, z + 0.15));
  return g;
}

function signPanel(root, own, text, bg, x, y, z, ry, w, h, glow) {
  const tex = TX.smallSign(text, bg, '#FFFFFF', 512, Math.round(512 * h / w));
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: '#FFFFFF', emissiveMap: tex, emissiveIntensity: glow });
  own.push(tex, mat);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  root.add(m);
}
