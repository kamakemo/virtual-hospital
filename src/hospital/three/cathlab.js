import * as THREE from 'three';
import { MAT, box, rbox, cyl, plane, part, tube, bake, screenMat } from './kit.js';
import * as TX from './textures.js';
import { labDisplay } from './cathDisplay.js';
import { cathMaterials, panelTexture, label, contactShadows, hangingCloth, consoleCart, storageCabinet, controlStation } from './cathDetails.js';
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
  const materials = cathMaterials(own);

  /* ---------- shell: white walls with a pale-blue band, glossy grey floor ---------- */
  flat(new THREE.PlaneGeometry(W, L), surf(TX.vinyl('#BBC2C8'), 5, 6, { roughness: 0.48, metalness: 0.05 }), 0, 0, 0);
  flat(new THREE.PlaneGeometry(CTRL.x1 - ROOM.x1, CTRL.z1 - CTRL.z0), surf(TX.vinyl('#BFC4C8'), 2, 3), (ROOM.x1 + CTRL.x1) / 2, 0, (CTRL.z0 + CTRL.z1) / 2);
  const wallMat = MAT.paint('#E0E5E8', 0.72);
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
  // Sealed wall panel joints stop large clinical surfaces reading as blank boxes.
  for (let x = -4.8; x < 5; x += 1.2) shell.add(part(box(0.006, H, 0.012), MAT.paint('#B3BEC5', .75), x, H / 2, ROOM.z0 + .013));
  for (let z = -5.4; z < 6; z += 1.2) shell.add(part(box(0.012, H, 0.006), MAT.paint('#B3BEC5', .75), ROOM.x0 + .013, H / 2, z));
  // the lab / control-room partition: a long lead-glass window and a door
  const xw = ROOM.x1;
  const WIN = { y0: 0.9, y1: 2.5, z0: -6, z1: 1.4 };
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

  const leadGlass = new THREE.MeshStandardMaterial({ color: '#CBDDE4', roughness: 0.18, metalness: 0.18, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
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
  tbl.add(part(rbox(1.0, 0.08, 1.45, 0.025), MAT.steel(), 0, 0.03, PZ));
  tbl.add(part(rbox(.78,.3,1.12,.035), white, 0,.24,PZ));
  tbl.add(part(rbox(.67,.29,1.0,.025), MAT.paint('#1F2427',.6),0,.54,PZ));
  for(let k=0;k<9;k++) tbl.add(part(box(.69,.014,1.02),MAT.paint('#33393E',.5),0,.41+k*.032,PZ));
  tbl.add(label(own,panelTexture(own,'TABLE DRIVE'),.31,.12,-.15,.25,PZ+.566));
  for(const x of [.15,.22]) tbl.add(part(cyl(.02,.02,.012,12),MAT.charcoal(),x,.23,PZ+.567,Math.PI/2));
  tbl.add(part(box(.72,.008,.018),MAT.lightGrey(),0,.13,PZ+.567));
  tbl.add(part(rbox(0.76, 0.2, 1.15, 0.04), white, 0, 0.78, PZ));
  tbl.add(part(rbox(0.5, 0.06, 0.8, 0.02), MAT.lightGrey(), 0, TABLE.y - 0.06, PZ));
  const equipmentID = panelTexture(own, 'CV-04 / PROCEDURE TABLE');
  tbl.add(label(own, equipmentID, .26, .13, -.18, .79, PZ + .578));
  tbl.add(part(rbox(.19,.13,.016,.008), MAT.paint('#C1CCD3', .4), .23,.79,PZ+.58));
  for (let k=0;k<4;k++) tbl.add(part(cyl(.009,.009,.009,8), MAT.steel(), -.3+k*.2,.85,PZ+.581,Math.PI/2));
  for (const side of [-1,1]) {
    tbl.add(part(rbox(.055,.065,2.3,.012),MAT.lightGrey(),side*(TABLE.w/2+.055),TABLE.y-.075,-.55));
    for(let k=0;k<7;k++) {
      const z=-1.55+k*.32;
      tbl.add(part(box(.025,.04,.016),MAT.charcoal(),side*(TABLE.w/2+.088),TABLE.y-.075,z));
      tbl.add(part(rbox(.075,.09,.095,.008),MAT.chrome(),side*(TABLE.w/2+.07),TABLE.y-.13,z));
    }
  }
  tbl.add(label(own,panelTexture(own,'TABLE CONTROL',{controls:true}),.36,.18,-TABLE.w/2-.078,.91,-.1,-Math.PI/2));
  tbl.add(part(rbox(.035,.2,.4,.015),MAT.lightGrey(),-TABLE.w/2-.055,.91,-.1));
  // table-side controls and the lead skirt, on the operator's side (+x)
  tbl.add(part(rbox(0.06, 0.16, 0.5, 0.02), MAT.charcoal(), TABLE.w / 2 + 0.07, TABLE.y - 0.06, 0.1));
  for (const dz of [-0.15, 0, 0.15]) tbl.add(part(cyl(0.012, 0.016, 0.07, 10), MAT.charcoal(), TABLE.w / 2 + 0.11, TABLE.y + 0.02, 0.1 + dz));
  tbl.add(hangingCloth(own, materials.lead, 1.9, .72, TABLE.w/2+.06, TABLE.y-.07, -.95, Math.PI/2));
  tbl.add(part(rbox(0.32, 0.05, 0.36, 0.025), MAT.paint('#3D454C', 0.8), 0, TABLE.y + 0.07, TABLE.head + 0.25));
  // Connected service loops return to their sockets on the table drive.
  for (const [dx, ex, ez] of [[-.2,-.65,1.38],[.2,.7,1.42]]) {
    tbl.add(new THREE.Mesh(tube([[dx,.67,PZ+.32],[ex*.5,.19,1.18],[ex,.06,ez],[ex+.12,.045,ez+.2],[ex*.8,.06,ez+.35],[dx,.11,PZ+.6],[dx,.42,PZ+.52]],.022,42),hoseMat));
    tbl.add(part(cyl(.035,.035,.03,12),MAT.charcoal(),dx,.43,PZ+.52,Math.PI/2));
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
  g.traverse(o => { if (o.isMesh && o.material.map === TX.sterileDrape()) o.material = materials.cloth; });
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
  ring(R - .105, R - .078, .475, MAT.paint('#9AA8B1', .35));
  // Front/back track screws, gasket segments and recessed access panels.
  for(let k=0;k<13;k++) {
    const a=Math.PI/2+(k+.3)*Math.PI/13;
    for(const dz of [-.245,.245]) C.add(part(cyl(.008,.008,.012,8),MAT.steel(),Math.cos(a)*R,Math.sin(a)*R,dz,Math.PI/2));
  }
  for(const angle of [1.85,2.45,3.12,3.8,4.45]) {
    const x=Math.cos(angle)*(R+.12),y=Math.sin(angle)*(R+.12);
    C.add(part(box(.015,.18,.44),MAT.paint('#B7C2C9',.6),x,y,0,0,0,angle-Math.PI/2));
  }
  C.add(label(own,panelTexture(own,'ANGIOGRAPHY SYSTEM'),.19,.1,-R-.15,.04,.256));
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
  carm.add(label(own,panelTexture(own,'GANTRY CONTROL',{controls:true}),.23,.14,colX,back.y+.62,back.z+.256));
  for(const y of [back.y+.25,colTop-.2]) carm.add(part(box(.4,.007,.012),MAT.paint('#B6C2CA',.6),colX,y,back.z+.258));
  for(const dx of [-.15,.15]) carm.add(part(cyl(.007,.007,.012,8),MAT.steel(),colX+dx,back.y+.22,back.z+.262,Math.PI/2));
  carm.add(new THREE.Mesh(tube([[colX - 0.15, colTop, back.z - 0.2], [colX - 0.35, colTop - 0.5, back.z - 0.3], [back.x - 0.1, back.y + 0.1, back.z - 0.3], [back.x, back.y - 0.1, back.z - 0.2]], 0.045, 40), hoseMat));
  root.add(bake(carm));

  /* ---------- the angiography wall on its ceiling boom, facing the operator ---------- */
  const live = labDisplay();
  own.push(live.texture, live.monitorTexture);
  const MW = 2.75, MH = MW / live.aspect;
  const boom = new THREE.Group();
  const screens = new THREE.Group();
  screens.position.set(1.35, 2.14, -2.65);
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
  for(let k=0;k<10;k++) screens.add(part(box(.12,.006,.012),MAT.grey(),MW/2-.08,-MH/2+.06+k*.02,-.051));
  for(const dx of [-MW/2+.12,MW/2-.12]) screens.add(part(cyl(.006,.006,.012,8),MAT.steel(),dx,-MH/2-.015,.049,Math.PI/2));
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
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.018, fh, fw), new THREE.MeshStandardMaterial({ color: '#D8E8ED', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false }));
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
  for(const dx of [-.068,.068]) {
    kit.add(part(cyl(.032,.032,.22,18),MAT.glassClear(),-.85+dx,1.2,-2.67,Math.PI/2));
    kit.add(part(cyl(.033,.033,.028,18),MAT.lightGrey(),-.85+dx,1.2,-2.54,Math.PI/2));
    kit.add(part(cyl(.019,.019,.032,12),MAT.paint('#B5D6E6',.3),-.85+dx,1.2,-2.515,Math.PI/2));
    kit.add(new THREE.Mesh(tube([[-.85+dx,1.2,-2.5],[-.8,1.05,-2.35],[-.55,1.05,-1.9],[-.42,1.02,-1.55]],.004,24),MAT.paint('#C8DCE5',.25)));
  }
  // the injector's touchscreen pedestal beside the table, as in every modern lab
  kit.add(part(cyl(0.03, 0.03, 1.0, 10), MAT.plastic(), 1.15, 0.55, -2.25));
  kit.add(part(rbox(0.5, 0.05, 0.5, 0.02), MAT.lightGrey(), 1.15, 0.03, -2.25));
  const tsGroup = new THREE.Group();
  tsGroup.position.set(1.15, 1.15, -2.25); tsGroup.rotation.set(0, 0.7, 0);
  tsGroup.add(part(rbox(0.46, 0.34, 0.06, 0.03), MAT.plastic(), 0, 0, 0));
  tsGroup.add(part(plane(0.38, 0.26), screenMat(TX.workstationScreen(), 0.85), 0, 0, 0.032));
  kit.add(tsGroup);
  // IVUS console and IABP on the far side
  kit.add(consoleCart(own,-3.7,.1,screenMat(TX.workstationScreen(),.7),.3));
  const iabp = { texture: live.monitorTexture };

  kit.add(consoleCart(own,-2.6,-3.5,screenMat(iabp.texture,.8),.2));

  // the sterile back table: blue drape, blue trays, steel bowls, gauze, syringes, wire hoops
  kit.add(sterileTrolley(own, materials.cloth, 2.25, 1.3, 1.65, 0.78, true, -0.15));
  // a second, smaller draped trolley and supply carts along the left wall
  kit.add(sterileTrolley(own, materials.cloth, -4.25, 3.0, 0.9, 0.6, false, Math.PI / 2));
  kit.add(sterileTrolley(own, materials.cloth, -4.3, 1.3, 0.9, 0.6, false, Math.PI / 2));

  // red-drawer emergency trolley with its defibrillator, far right
  kit.add(crashCart({ x: 4.3, z: 3.6, ry: Math.PI }));
  const defib = { texture: live.monitorTexture };

  const dGroup = new THREE.Group();
  dGroup.position.set(4.3, 1.32, 3.6); dGroup.rotation.y = -Math.PI / 2;
  dGroup.add(part(rbox(0.42, 0.3, 0.16, 0.03), MAT.paint('#EDEDE8', 0.45), 0, 0, 0));
  dGroup.add(part(plane(0.3, 0.2), screenMat(defib.texture, 0.9), 0, 0.02, 0.081));
  kit.add(dGroup);

  // A pump pole close to the patient's head, with connected tubing and leads.
  kit.add(ivPole({x:-1.9,z:-2.65,pumps:3}));
  const tubing=MAT.paint('#C8DCE5',.3);
  kit.add(new THREE.Mesh(tube([[-1.9,1.8,-2.65],[-1.82,1.35,-2.5],[-1.4,1.05,-2.15],[-.75,1.02,-1.9]],.004,30),tubing));
  const leads=[['#D1D9DE',-.2,-1.75],['#D2AD53',-.12,-1.5],['#7BB39A',.07,-1.7]];
  for(const [color,x,z] of leads) kit.add(new THREE.Mesh(tube([[x,1.12,z],[-.43,1.05,z+.1],[-.67,.65,-1.7],[-.9,.23,-1.9],[-2.6,.16,-3.35],[-2.6,.85,-3.5]],.004,32),MAT.paint(color,.6)));
  // left wall: medical gas rail, monitors on arms, IV poles, a monitoring cart
  kit.add(part(rbox(0.1, 0.24, 4.6, 0.02), MAT.lightGrey(), ROOM.x0 + 0.06, 1.5, -1.0));
  for (let k = 0; k < 10; k++) {
    const col = ['#2E9B4E', '#E8C33A', '#222', '#3B6FC2', '#F2F2F2'][k % 5];
    kit.add(part(cyl(0.025, 0.025, 0.03, 12), MAT.paint(col, 0.4), ROOM.x0 + 0.12, 1.5, -3.1 + k * 0.42, 0, 0, Math.PI / 2));
  }
  for (const z of [-2.4, -0.2]) {
    const lm = { texture: live.monitorTexture };
    const m = wallMonitor(lm.texture, true); m.position.set(ROOM.x0, 0, z); kit.add(m);
  }
  kit.add(ivPole({ x: -4.3, z: -1.3, pumps: 2 }));
  kit.add(ivPole({ x: -4.0, z: 0.2, pumps: 1 }));
  const mon = { texture: live.monitorTexture };
  kit.add(consoleCart(own, -4.25, -3.4, screenMat(mon.texture, .8), .2));

  // Glass-fronted storage with visible shelves (no opaque front hiding supplies).
  for(let k=0;k<3;k++) kit.add(storageCabinet(own,-4.32+k*1.2,ROOM.z0+.3));
  kit.add(apronRack({ x: ROOM.x0 + 0.04, z: 4.4, ry: 0 }));
  // control room: desk, displays, chairs
  kit.add(part(rbox(0.8, 0.05, 6.6, 0.02), MAT.laminate(), 5.75, 0.76, -2.5));
  for(let k=0;k<4;k++) kit.add(controlStation(own,-5+k*1.6,screenMat(k===1?live.texture:TX.workstationScreen(),.72)));
  kit.add(plant({ x: 8.2, z: 0.8, h: 1.3 }));
  root.add(bake(kit));
  root.add(contactShadows(own, [[0,.55,1.55,2.1],[-3.7,.1,.9,.9],[-2.6,-3.5,.9,.9],[2.25,1.3,2,.95],[-1.9,-2.65,.85,.85]]));

  /* ---------- the day's list on the wall screen, inside the entrance ---------- */
  const listTex = scheduleBoard(floor);
  const listMat = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#FFF', emissiveMap: listTex, emissiveIntensity: 0.95, roughness: 0.4 });
  own.push(listTex, listMat);
  root.add(part(rbox(0.06, 0.9, 1.45, 0.02), MAT.charcoal(), ROOM.x0 + 0.04, 2.35, 2.2));
  root.add(part(plane(1.37, 0.86), listMat, ROOM.x0 + 0.075, 2.35, 2.2, 0, Math.PI / 2, 0));

  /* ---------- light: bright, even, clinical ---------- */
  root.add(new THREE.HemisphereLight('#EFF4F8', '#778593', 0.5));
  const key = new THREE.DirectionalLight('#F8FBFF', 1.05);
  key.position.set(-2.2, 5.7, 1.5);
  key.target.position.set(0, 0, -1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  root.add(key, key.target);
  const fill = new THREE.PointLight('#F0F5FF', 2, 8, 2);
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
    exposure: .98,
    shadowLight: key,
    entry: { pos: new THREE.Vector3(-2.85, 1.8, 3.65), target: new THREE.Vector3(0.15, 1.15, -1.15) },
    views: {
      overview: { pos: new THREE.Vector3(-2.85, 1.8, 3.65), target: new THREE.Vector3(0.15, 1.15, -1.15) },
      operator: { pos: new THREE.Vector3(2.6, 1.7, 0.45), target: new THREE.Vector3(0, 1.25, -1.8) },
      monitors: { pos: new THREE.Vector3(1.8, 1.75, 0.4), target: new THREE.Vector3(1.35, 2.14, -2.65) },
    },
    update(t) { live.draw(t); },
    dispose() {
      live.dispose();
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
function sterileTrolley(own, clothMaterial, x, z, len, dep, laidOut, ry = 0) {
  const outer = new THREE.Group();
  const g = new THREE.Group();
  const top = 0.92, blue = clothMaterial, tray = MAT.paint('#2C6FD6', 0.35);
  g.add(part(rbox(len, 0.03, dep, 0.01), MAT.chrome(), 0, top, 0));
  g.add(part(rbox(len, 0.025, dep, 0.01), MAT.chrome(), 0, 0.3, 0));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    g.add(part(cyl(0.015, 0.015, top - 0.06, 8), MAT.chrome(), dx * (len / 2 - 0.03), top / 2, dz * (dep / 2 - 0.03)));
    g.add(part(cyl(0.035, 0.035, 0.03, 12), MAT.castor(), dx * (len / 2 - 0.03), 0.035, dz * (dep / 2 - 0.03), Math.PI / 2, 0, 0));
  }
  g.add(part(rbox(len + 0.06, 0.012, dep + 0.06, 0.004), blue, 0, top + 0.022, 0));
  g.add(hangingCloth(own,blue,len+.06,.48,0,top+.02,dep/2+.035));
  g.add(hangingCloth(own,blue,len+.06,.43,0,top+.02,-dep/2-.035,Math.PI));
  g.add(hangingCloth(own,blue,dep+.06,.45,len/2+.035,top+.02,0,Math.PI/2));
  g.add(hangingCloth(own,blue,dep+.06,.45,-len/2-.035,top+.02,0,-Math.PI/2));
  g.add(part(rbox(len * 0.6, 0.08, dep * 0.6, 0.01), MAT.steel(), 0, 0.36, 0));
  const y = top + 0.03;
  if (laidOut) {
    for (let k = 0; k < 3; k++) g.add(part(rbox(0.18, 0.05, 0.13, 0.015), tray, -len / 2 + 0.16 + k * 0.21, y + 0.025, -dep / 2 + 0.12));
    for(const [dx,r] of [[len/2-.28,.09],[len/2-.12,.07]]) {
      const profile=[[0,0],[r*.74,0],[r,.055],[r-.005,.055],[r*.7,.007],[0,.007]].map(([x,y])=>new THREE.Vector2(x,y));
      const bowl=new THREE.LatheGeometry(profile,24);own.push(bowl);
      g.add(part(bowl,MAT.chrome(),dx,y+.004,-dep/2+.16));
    }
    for(let k=0;k<4;k++) {
      const x=-.2+k*.12;
      g.add(new THREE.Mesh(tube([[x,y+.012,.16],[x+.035,y+.012,.08],[x+.023,y+.012,-.1]],.003,12),MAT.chrome()));
      g.add(new THREE.Mesh(tube([[x+.022,y+.012,.16],[x+.045,y+.012,.08],[x+.026,y+.012,-.1]],.003,12),MAT.chrome()));
    }
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

function signPanel(root, own, text, bg, x, y, z, ry, w, h, glow) {
  const tex = TX.smallSign(text, bg, '#FFFFFF', 512, Math.round(512 * h / w));
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: '#FFFFFF', emissiveMap: tex, emissiveIntensity: glow });
  own.push(tex, mat);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  root.add(m);
}
