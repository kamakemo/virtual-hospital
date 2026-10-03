import * as THREE from 'three';
import { MAT, box, rbox, cyl, sphere, plane, part, tube, bake, screenMat } from './kit.js';
import * as TX from './textures.js';
import { BED } from './bedFrame.js';
import { buildPatient } from './patient.js';
import { crashCart, apronRack, plant } from './props.js';

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
   operator stands on the patient's right, at -x.
   ============================================================ */

const ROOM = { x0: -5, x1: 5, z0: -6, z1: 6, H: 3.05 };
const CTRL = { x1: 8.6, z0: -6, z1: 3.1 };
const TABLE = { y: 0.95, head: -2.45, foot: 0.75, w: 0.52 };
const ISO = new THREE.Vector3(0, 1.05, -1.8);       // the C-arm's isocentre, over the heart
const BT = { x: -3.3, z: 1.3 };                       // the sterile back table, beside the operator

/* ---------- the big screen: live fluoro, reference, haemodynamics, IVUS ---------- */

function labDisplay() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 576;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  // a static coronary "angiogram" on fluoroscopic grain, drawn once
  const fluoro = document.createElement('canvas');
  fluoro.width = 500; fluoro.height = 280;
  const f = fluoro.getContext('2d');
  const grd = f.createRadialGradient(250, 140, 20, 250, 140, 260);
  grd.addColorStop(0, '#B9B9B9'); grd.addColorStop(1, '#3E3E3E');
  f.fillStyle = grd; f.fillRect(0, 0, 500, 280);
  for (let i = 0; i < 9000; i++) { f.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; f.fillRect(Math.random() * 500, Math.random() * 280, 2, 2); }
  f.strokeStyle = '#1D1D1D'; f.lineCap = 'round';
  const vessel = (pts, w) => { f.lineWidth = w; f.beginPath(); pts.forEach(([x, y], i) => (i ? f.lineTo(x, y) : f.moveTo(x, y))); f.stroke(); };
  vessel([[120, 60], [150, 70], [190, 90]], 7);                                  // guide + LM
  vessel([[190, 90], [230, 110], [270, 140], [310, 175], [345, 215], [370, 255]], 5); // LAD
  vessel([[255, 128], [300, 120], [350, 128]], 3);                               // diagonal
  vessel([[190, 90], [215, 130], [225, 180], [215, 230]], 4);                     // circumflex
  vessel([[218, 160], [255, 195]], 2.5);                                          // obtuse marginal
  f.lineWidth = 2; f.strokeStyle = '#555'; vessel([[30, 40], [120, 60]], 3);       // catheter
  f.fillStyle = '#9A9A9A'; f.beginPath(); f.arc(262, 134, 4, 0, Math.PI * 2); f.fill(); // the lesion: a waist

  const ivus = document.createElement('canvas');
  ivus.width = 240; ivus.height = 240;
  const v = ivus.getContext('2d');
  v.fillStyle = '#000'; v.fillRect(0, 0, 240, 240);
  for (let i = 0; i < 16000; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 110;
    const b = r > 40 && r < 95 ? 0.5 * Math.random() : 0.12 * Math.random();
    v.fillStyle = `rgba(255,255,255,${b})`;
    v.fillRect(120 + Math.cos(a) * r, 120 + Math.sin(a) * r, 1.5, 1.5);
  }
  v.strokeStyle = 'rgba(255,255,255,0.95)'; v.lineWidth = 6;
  v.beginPath(); v.arc(120, 120, 62, -0.6, 2.6); v.stroke();                      // calcium arc
  v.fillStyle = '#000'; v.beginPath(); v.arc(120, 120, 34, 0, Math.PI * 2); v.fill();
  v.fillStyle = '#9AA'; v.beginPath(); v.arc(120, 120, 6, 0, Math.PI * 2); v.fill();

  function draw(t) {
    g.fillStyle = '#05080B'; g.fillRect(0, 0, 1024, 576);
    // tile 1: live fluoroscopy (with flicker), tile 2: reference run
    g.drawImage(fluoro, 8, 8, 500, 280);
    g.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`; g.fillRect(8, 8, 500, 280);
    g.drawImage(fluoro, 516, 8, 500, 280);
    g.fillStyle = '#FFB020'; g.font = '600 15px "IBM Plex Mono", monospace';
    g.fillText('LIVE  LAO 30  CRA 20', 18, 28); g.fillText('REF  RAO 20  CRA 30', 526, 28);
    // tile 3: haemodynamics
    g.fillStyle = '#0A1016'; g.fillRect(8, 296, 640, 272);
    const traces = [
      { y: 340, a: 26, c: '#38E07A', fn: p => { const x = p % 1; return x < 0.05 ? 0 : x < 0.08 ? 1 : x < 0.11 ? -0.3 : x > 0.3 && x < 0.45 ? Math.sin((x - 0.3) / 0.15 * Math.PI) * 0.2 : 0; } },
      { y: 430, a: 44, c: '#FF5A52', fn: p => { const x = p % 1; return x < 0.18 ? Math.sin(x / 0.18 * Math.PI / 2) : x < 0.3 ? 1 - (x - 0.18) * 1.5 : x < 0.34 ? 0.82 + (x - 0.3) : Math.max(0, 0.86 - (x - 0.34) * 1.2); } },
      { y: 520, a: 22, c: '#3ED0F5', fn: p => { const x = p % 1; return x < 0.3 ? Math.sin(x / 0.3 * Math.PI / 2) : Math.max(0, 1 - (x - 0.3) * 1.4); } },
    ];
    for (const tr of traces) {
      g.strokeStyle = tr.c; g.lineWidth = 2; g.beginPath();
      for (let x = 0; x < 500; x += 2) {
        const yy = tr.y - tr.fn((t * 1.3) - (500 - x) / 180) * tr.a;
        x ? g.lineTo(18 + x, yy) : g.moveTo(18, yy);
      }
      g.stroke();
    }
    g.textAlign = 'right';
    g.fillStyle = '#38E07A'; g.font = '700 38px "IBM Plex Mono", monospace'; g.fillText('84', 636, 350);
    g.fillStyle = '#FF5A52'; g.font = '700 30px "IBM Plex Mono", monospace'; g.fillText('132/74', 636, 440);
    g.font = '500 16px "IBM Plex Mono", monospace'; g.fillText('(96)', 636, 462);
    g.fillStyle = '#3ED0F5'; g.font = '700 32px "IBM Plex Mono", monospace'; g.fillText('97', 636, 530);
    g.textAlign = 'left';
    // tile 4: IVUS
    g.drawImage(ivus, 676, 304, 256, 256);
    g.fillStyle = '#9FD3FF'; g.font = '600 13px "IBM Plex Mono", monospace'; g.fillText('IVUS 60 MHz', 944, 320);
    g.fillText('MLA 1.9', 944, 344);
    tex.needsUpdate = true;
  }
  draw(0);
  return { texture: tex, draw };
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
  const W = ROOM.x1 - ROOM.x0, L = ROOM.z1 - ROOM.z0;
  const surf = (tex, rx, ry, opts = {}) => {
    const t = tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true;
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, ...opts });
    own.push(t, m);
    return m;
  };
  const flat = (geo, mat, x, y, z, rx = -Math.PI / 2, ry = 0) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; root.add(m); return m;
  };

  /* ---------- shell: procedure room + control room ---------- */
  const floorMat = surf(TX.vinyl('#C9CFD3'), 4, 5, { roughness: 0.45 });
  flat(new THREE.PlaneGeometry(W, L), floorMat, 0, 0, 0);
  flat(new THREE.PlaneGeometry(CTRL.x1 - ROOM.x1, CTRL.z1 - CTRL.z0), surf(TX.vinyl('#B9BEC2'), 2, 3), (ROOM.x1 + CTRL.x1) / 2, 0, (CTRL.z0 + CTRL.z1) / 2);
  const wallMat = surf(TX.plaster('#E9EBEA'), 5, 1, { roughness: 0.9 });
  flat(new THREE.PlaneGeometry(L, ROOM.H), wallMat, ROOM.x0, ROOM.H / 2, 0, 0, Math.PI / 2);
  flat(new THREE.PlaneGeometry(W, ROOM.H), wallMat, 0, ROOM.H / 2, ROOM.z0, 0, 0);
  flat(new THREE.PlaneGeometry(W, ROOM.H), wallMat, 0, ROOM.H / 2, ROOM.z1, 0, Math.PI);
  flat(new THREE.PlaneGeometry(CTRL.x1 - ROOM.x1, ROOM.H), wallMat, (ROOM.x1 + CTRL.x1) / 2, ROOM.H / 2, CTRL.z0, 0, 0);
  flat(new THREE.PlaneGeometry(CTRL.z1 - CTRL.z0, ROOM.H), wallMat, CTRL.x1, ROOM.H / 2, (CTRL.z0 + CTRL.z1) / 2, 0, -Math.PI / 2);
  flat(new THREE.PlaneGeometry(CTRL.x1 - ROOM.x1, ROOM.H), wallMat, (ROOM.x1 + CTRL.x1) / 2, ROOM.H / 2, CTRL.z1, 0, Math.PI);
  // ceiling
  flat(new THREE.PlaneGeometry(W + 4, L), surf(TX.ceilingTiles(), (W + 4) / 0.6, L / 0.6, { roughness: 0.95 }), 1.8, ROOM.H, 0, Math.PI / 2);

  const shell = new THREE.Group();
  // the wall between lab and control room, with its lead-glass window and door
  const xw = ROOM.x1;
  shell.add(part(box(0.18, 0.9, 7.4), wallMat, xw, 0.45, -2.3));                     // below the window
  shell.add(part(box(0.18, ROOM.H - 2.3, 7.4), wallMat, xw, 2.3 + (ROOM.H - 2.3) / 2, -2.3));
  shell.add(part(box(0.18, ROOM.H, 3.2), wallMat, xw, ROOM.H / 2, 4.4));
  shell.add(part(box(0.18, 0.9, 1.1), wallMat, xw, ROOM.H - 0.45, 2.25));            // over the control-room door
  for (const z of [-6, -3.7, -1.4, 1.4]) shell.add(part(box(0.22, 1.42, 0.08), MAT.lightGrey(), xw, 1.6, z));
  shell.add(part(box(0.22, 0.08, 7.4), MAT.lightGrey(), xw, 0.94, -2.3));
  shell.add(part(box(0.22, 0.08, 7.4), MAT.lightGrey(), xw, 2.27, -2.3));
  // skirting, wall protection rail
  for (const [x, z, w, d] of [[ROOM.x0 + 0.01, 0, 0.02, L], [0, ROOM.z0 + 0.01, W, 0.02], [0, ROOM.z1 - 0.01, W, 0.02]]) {
    shell.add(part(box(w, 0.1, d), MAT.paint('#7F8890', 0.6), x, 0.05, z));
    shell.add(part(box(Math.max(w, 0.05), 0.07, Math.max(d, 0.05)), MAT.paint(floor.hue, 0.5), x, 1.02, z));
  }
  // entrance: a lead-lined sliding door, X-ray warning light over it
  shell.add(part(rbox(1.5, 2.2, 0.08, 0.02), MAT.paint('#D5D9DC', 0.5), -2.6, 1.1, ROOM.z1 - 0.06));
  shell.add(part(box(0.35, 0.5, 0.02), MAT.glassClear(), -2.6, 1.5, ROOM.z1 - 0.11));
  shell.add(part(rbox(0.04, 0.5, 0.05, 0.01), MAT.chrome(), -2.0, 1.05, ROOM.z1 - 0.12));
  root.add(bake(shell));

  // lead glass, faintly tinted
  const leadGlass = new THREE.MeshPhysicalMaterial({ color: '#D9C9A0', roughness: 0.04, transmission: 0.88, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
  own.push(leadGlass);
  flat(new THREE.PlaneGeometry(7.4, 1.33), leadGlass, xw, 1.6, -2.3, 0, Math.PI / 2);

  const warn = new THREE.MeshStandardMaterial({ color: '#500', emissive: '#FF3B2F', emissiveIntensity: 2.4 });
  own.push(warn);
  root.add(part(rbox(0.8, 0.18, 0.06, 0.02), warn, -2.6, 2.48, ROOM.z1 - 0.04));
  signPanel(root, own, 'X-RAY IN USE', '#B3261E', -2.6, 2.48, ROOM.z1 - 0.075, Math.PI, 0.74, 0.16, 0.9);
  signPanel(root, own, 'CARDIAC CATH LAB 1', '#2B3138', 0, 2.62, ROOM.z0 + 0.03, 0, 2.2, 0.32, 0.25);

  /* ---------- ceiling: rails, panels, surgical light ---------- */
  const ceil = new THREE.Group();
  for (const x of [-1.2, 1.4]) ceil.add(part(box(0.12, 0.08, 7.5), MAT.lightGrey(), x, ROOM.H - 0.04, -0.6));
  for (const [x, z] of [[-3.4, -3.5], [-3.4, 0], [-3.4, 3.5], [3.4, -4.4], [3.4, 2.6], [0, 3.6], [0, -4.6]]) {
    ceil.add(part(box(1.2, 0.02, 0.6), MAT.lightPanel(), x, ROOM.H - 0.012, z));
  }
  for (const [x, z] of [[6.8, -4], [6.8, -1]]) ceil.add(part(box(1.2, 0.02, 0.6), MAT.lightPanel(), x, ROOM.H - 0.012, z));
  // procedure light on its spring arm, over the groin and wrist
  ceil.add(part(cyl(0.05, 0.05, 0.6, 10), MAT.plastic(), -0.6, ROOM.H - 0.3, 0.9));
  ceil.add(part(rbox(0.7, 0.05, 0.05, 0.02), MAT.plastic(), -0.3, ROOM.H - 0.6, 0.9));
  ceil.add(part(cyl(0.3, 0.33, 0.1, 32), MAT.plastic(), 0.05, ROOM.H - 0.68, 0.9));
  ceil.add(part(cyl(0.27, 0.27, 0.01, 32), MAT.ledCool(), 0.05, ROOM.H - 0.735, 0.9));
  root.add(bake(ceil, { castShadow: false }));

  /* ---------- the table ---------- */
  const tbl = new THREE.Group();
  const tLen = TABLE.foot - TABLE.head, tMid = (TABLE.foot + TABLE.head) / 2;
  tbl.add(part(rbox(TABLE.w, 0.045, tLen, 0.02), MAT.paint('#1E2328', 0.35), 0, TABLE.y, tMid));          // carbon-fibre top
  tbl.add(part(rbox(TABLE.w - 0.02, 0.03, tLen - 0.05, 0.015), MAT.paint('#2F3A44', 0.8), 0, TABLE.y + 0.035, tMid)); // pad
  for (const s of [-1, 1]) tbl.add(part(box(0.025, 0.03, tLen * 0.75), MAT.chrome(), s * (TABLE.w / 2 + 0.02), TABLE.y - 0.01, tMid + 0.3));
  tbl.add(part(rbox(0.55, 0.72, 0.75, 0.05), MAT.plastic(), 0, 0.42, 0.25));                              // pedestal
  tbl.add(part(rbox(0.9, 0.08, 1.15, 0.03), MAT.lightGrey(), 0, 0.04, 0.25));
  tbl.add(part(rbox(0.42, 0.14, 0.6, 0.03), MAT.lightGrey(), 0, 0.85, 0.25));
  // table-side control module (geometry, panning, C-arm), operator side
  tbl.add(part(rbox(0.06, 0.16, 0.5, 0.02), MAT.charcoal(), -(TABLE.w / 2 + 0.07), TABLE.y - 0.06, 0.15));
  for (const dz of [-0.15, 0, 0.15]) tbl.add(part(cyl(0.012, 0.016, 0.07, 10), MAT.charcoal(), -(TABLE.w / 2 + 0.11), TABLE.y + 0.02, 0.15 + dz));
  // lead skirt hanging from the operator-side rail
  tbl.add(part(rbox(0.02, 0.8, 1.9, 0.01), MAT.paint('#3D4852', 0.85), -(TABLE.w / 2 + 0.04), TABLE.y - 0.45, -0.85));
  for (let k = 0; k < 9; k++) tbl.add(part(box(0.022, 0.78, 0.008), MAT.paint('#2E3740', 0.85), -(TABLE.w / 2 + 0.045), TABLE.y - 0.45, -1.75 + k * 0.22));
  // head rest
  tbl.add(part(rbox(0.32, 0.05, 0.36, 0.025), MAT.paint('#2F3A44', 0.8), 0, TABLE.y + 0.07, TABLE.head + 0.25));
  root.add(bake(tbl));

  /* ---------- the patient, draped, right arm out for radial access ---------- */
  const g = new THREE.Group();
  const headGroup = new THREE.Group();
  headGroup.position.set(BED.hingeX, BED.deckY, 0);
  g.add(headGroup);
  const header = floor.beds[0];
  buildPatient(g, headGroup, 0, 'cathlab', { seed: 0x9e3779b1 >>> 0, cap: true, support: 'none', table: true });
  // bed-unit frame → table: bed +x (toward the feet) runs along +z
  g.rotation.y = -Math.PI / 2;
  g.position.set(0, TABLE.y + 0.05 - (BED.deckY + BED.mattressT), TABLE.head - 0.05);
  const patient = bake(g);
  root.add(patient);

  /* ---------- the C-arm, at LAO 30 / CRA 20 over the heart ---------- */
  const carm = new THREE.Group();
  carm.position.copy(ISO);
  const C = new THREE.Group();
  C.rotation.set(THREE.MathUtils.degToRad(-12), 0, THREE.MathUtils.degToRad(15));
  const R = 0.98;
  const arc = new THREE.Mesh(new THREE.TorusGeometry(R, 0.085, 14, 72, THREE.MathUtils.degToRad(215)), MAT.plastic());
  arc.rotation.z = THREE.MathUtils.degToRad(-107);
  arc.scale.set(1, 1, 1.9);                                                            // a deep, flat-sided C
  C.add(arc);
  // flat-panel detector above, tube housing below
  C.add(part(rbox(0.58, 0.16, 0.58, 0.04), MAT.plastic(), 0, R - 0.36, 0));
  C.add(part(rbox(0.5, 0.02, 0.5, 0.01), MAT.charcoal(), 0, R - 0.45, 0));
  C.add(part(rbox(0.36, 0.28, 0.36, 0.06), MAT.plastic(), 0, -(R - 0.32), 0));
  C.add(part(cyl(0.11, 0.13, 0.08, 20), MAT.charcoal(), 0, -(R - 0.5), 0));
  C.add(part(rbox(0.24, 0.32, 0.4, 0.04), MAT.lightGrey(), R + 0.12, 0, 0));          // carriage on the C's back
  carm.add(C);
  // floor stand beside the table, L-arm to the carriage
  const stand = new THREE.Group();
  stand.add(part(rbox(0.85, 0.1, 1.0, 0.03), MAT.lightGrey(), 1.75, -ISO.y + 0.05, -0.2));
  stand.add(part(rbox(0.5, 1.15, 0.55, 0.05), MAT.plastic(), 1.75, -ISO.y + 0.68, -0.2));
  stand.add(part(rbox(0.62, 0.3, 0.42, 0.05), MAT.plastic(), 1.32, 0.22, -0.05));
  carm.add(stand);
  root.add(bake(carm));

  /* ---------- monitor bank on its ceiling boom, facing the operator ---------- */
  const live = labDisplay();
  own.push(live.texture);
  const boom = new THREE.Group();
  boom.add(part(cyl(0.05, 0.05, 0.7, 10), MAT.plastic(), 1.4, ROOM.H - 0.35, -0.5));
  boom.add(part(rbox(0.9, 0.07, 0.07, 0.02), MAT.plastic(), 1.2, ROOM.H - 0.72, -0.6));
  const screens = new THREE.Group();
  screens.position.set(1.3, 2.0, -0.75);
  screens.rotation.y = -Math.PI / 2 + 0.28;
  screens.add(part(rbox(1.72, 1.0, 0.08, 0.02), MAT.charcoal(), 0, 0, 0));
  const big = part(plane(1.64, 0.92), screenMat(live.texture, 1.05), 0, 0, 0.045);
  big.userData.keep = true;
  screens.add(big);
  boom.add(screens);
  boom.add(part(cyl(0.025, 0.025, 0.3, 8), MAT.plastic(), 1.2, ROOM.H - 0.86, -0.6));
  root.add(bake(boom));

  /* ---------- lead acrylic shield, ceiling-suspended, operator side ---------- */
  const shieldArm = new THREE.Group();
  shieldArm.add(part(cyl(0.035, 0.035, 0.9, 10), MAT.plastic(), -1.2, ROOM.H - 0.45, -1.0));
  shieldArm.add(part(rbox(0.65, 0.05, 0.05, 0.02), MAT.plastic(), -0.95, ROOM.H - 0.9, -1.0));
  shieldArm.add(part(rbox(0.05, 0.05, 0.05, 0.02), MAT.charcoal(), -0.66, ROOM.H - 0.9, -1.0));
  for (let k = 0; k < 7; k++) shieldArm.add(part(box(0.012, 0.22, 0.07), MAT.paint('#3D4852', 0.85), -0.62, 1.25, -1.33 + k * 0.08));
  root.add(bake(shieldArm));
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.78, 0.62), new THREE.MeshPhysicalMaterial({ color: '#D8B97A', roughness: 0.05, transmission: 0.85, transparent: true, opacity: 0.38, depthWrite: false }));
  own.push(shield.material);
  shield.position.set(-0.62, 1.75, -1.1);
  shield.rotation.y = 0.18;
  root.add(shield);

  /* ---------- equipment around the table ---------- */
  const kit = new THREE.Group();
  // contrast injector at the head of the table
  kit.add(part(cyl(0.035, 0.035, 1.1, 10), MAT.plastic(), 0.85, 0.6, -2.9));
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; kit.add(part(box(0.32, 0.03, 0.05), MAT.lightGrey(), 0.85 + Math.cos(a) * 0.16, 0.06, -2.9 + Math.sin(a) * 0.16, 0, -a, 0)); }
  kit.add(part(rbox(0.22, 0.18, 0.34, 0.03), MAT.plastic(), 0.85, 1.2, -2.85));
  kit.add(part(cyl(0.045, 0.045, 0.24, 14), MAT.glassClear(), 0.85, 1.12, -2.62, Math.PI / 2, 0, 0));
  kit.add(part(rbox(0.04, 0.2, 0.28, 0.01), MAT.charcoal(), 0.98, 1.38, -2.85));
  // IVUS console
  kit.add(cart(1.8, 1.25, '#1F2A33', screenMat(TX.workstationScreen(), 0.8)));
  // IABP console with its helium cylinder
  const iabp = TX.liveMonitor(2);
  own.push(iabp.texture);
  kit.add(cart(2.4, -3.4, '#E8EAEC', screenMat(iabp.texture, 0.9), true));
  // sterile back table: blue drape, bowls, syringes, wires coiled in their hoops
  kit.add(part(rbox(1.3, 0.04, 0.65, 0.01), MAT.chrome(), BT.x, 0.92, BT.z));
  for (const [dx, dz] of [[-0.6, -0.28], [0.6, -0.28], [-0.6, 0.28], [0.6, 0.28]]) kit.add(part(cyl(0.015, 0.015, 0.9, 8), MAT.chrome(), BT.x + dx, 0.46, BT.z + dz));
  kit.add(part(rbox(1.36, 0.02, 0.7, 0.005), MAT.paint('#356C9E', 0.95), BT.x, 0.95, BT.z));
  for (const [dx, dz, r] of [[-0.4, -0.12, 0.09], [-0.15, 0.15, 0.07], [0.1, -0.1, 0.06]]) kit.add(part(cyl(r, r * 0.8, 0.06, 20), MAT.chrome(), BT.x + dx, 0.99, BT.z + dz));
  for (let k = 0; k < 4; k++) kit.add(part(cyl(0.012, 0.012, 0.16, 8), MAT.glassClear(), BT.x + 0.35 + k * 0.05, 0.975, BT.z - 0.2, Math.PI / 2, 0, 0));
  for (const dz of [0.05, 0.22]) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.008, 6, 28), MAT.paint('#2E5E8E', 0.5));
    hoop.rotation.x = Math.PI / 2; hoop.position.set(BT.x + 0.5, 0.975, BT.z + dz); kit.add(hoop);
  }
  // supply cabinets along the left wall
  for (let k = 0; k < 4; k++) {
    const z = -5.2 + k * 1.2;
    kit.add(part(rbox(0.5, 2.0, 1.15, 0.02), MAT.laminate(), ROOM.x0 + 0.27, 1.0, z));
    kit.add(part(box(0.02, 1.4, 1.0), MAT.glassClear(), ROOM.x0 + 0.53, 1.25, z));
    for (let s = 0; s < 4; s++) for (let b = 0; b < 4; b++) kit.add(part(box(0.3, 0.12, 0.2), MAT.paint(['#E6E1D5', '#C8D6E4', '#F2F2EE', '#D9E6D6'][(s + b) % 4], 0.8), ROOM.x0 + 0.3, 0.75 + s * 0.33, z - 0.38 + b * 0.25));
  }
  kit.add(crashCart({ x: -3.9, z: 4.4, ry: Math.PI / 2 }));
  kit.add(apronRack({ x: ROOM.x0 + 0.04, z: 2.6, ry: 0 }));
  // control room: desk, four displays, two chairs
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

  /* ---------- the day's list on the wall screen ---------- */
  const listTex = scheduleBoard(floor);
  const listMat = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#FFF', emissiveMap: listTex, emissiveIntensity: 0.95, roughness: 0.4 });
  own.push(listTex, listMat);
  root.add(part(rbox(0.06, 1.12, 1.8, 0.02), MAT.charcoal(), ROOM.x0 + 0.04, 1.75, 0.6));
  const listScreen = part(plane(1.7, 1.06), listMat, ROOM.x0 + 0.075, 1.75, 0.6, 0, Math.PI / 2, 0);
  root.add(listScreen);

  /* ---------- light ---------- */
  root.add(new THREE.HemisphereLight('#F2F7FF', '#B8BFC6', 0.6));
  const key = new THREE.DirectionalLight('#F6F9FF', 1.45);
  key.position.set(2.5, 11, 4);
  key.target.position.set(0, 0, -1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  root.add(key, key.target);
  const spot = new THREE.SpotLight('#FFFFFF', 18, 6, 0.55, 0.6, 1.6);
  spot.position.set(0.05, ROOM.H - 0.8, 0.9);
  spot.target.position.set(-0.15, TABLE.y, 0.3);
  root.add(spot, spot.target);

  /* ---------- the twelve list slots: all lead to the table ---------- */
  const cam = { pos: new THREE.Vector3(-1.35, 1.7, 1.1), target: new THREE.Vector3(0.45, 1.18, -1.6) };
  const beds = floor.beds.map((h, i) => ({
    index: i, number: i + 1, header: h, occupied: !!h, side: -1,
    hit: null, glow: null, label: null,
    cam,
  }));

  return {
    group: root,
    beds,
    listMode: true,
    shadowLight: key,
    entry: { pos: new THREE.Vector3(-2.3, 1.72, 3.9), target: new THREE.Vector3(0.4, 1.05, -1.7) },
    update(t) { live.draw(t); },
    dispose() {
      root.traverse(o => { if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose(); });
      own.forEach(x => x.dispose && x.dispose());
    },
  };
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
