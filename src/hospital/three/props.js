import * as THREE from 'three';
import { MAT, box, rbox, cyl, sphere, plane, part, tube, texMat, screenMat } from './kit.js';
import * as TX from './textures.js';
import { KIND } from '../data.js';

/* ============================================================
   PROPS
   Everything at a bedside, in metres, in the bed unit's local
   frame: the headwall is the plane x = 0, the bed runs out along
   +x, and z runs across the bay (bay is 3 m wide, z ∈ ±1.5).
   Proportions follow the reference beds: a 2.1 m frame, deck at
   0.5 m, mattress top at ~0.69 m, side rails to ~0.93 m.
   ============================================================ */

export const BED = {
  headX: 0.32,
  footX: 2.42,
  hingeX: 1.06,
  deckY: 0.535,
  mattressT: 0.15,
  width: 0.9,
  headLen: 0.72,
};

/** World (bed-unit) position of a point given in the raised head section. */
function headToUnit(x, y, angle) {
  const c = Math.cos(-angle), s = Math.sin(-angle);
  return new THREE.Vector3(BED.hingeX + x * c - y * s, BED.deckY + x * s + y * c, 0);
}

/* ---------- small reusable assemblies ---------- */

function castor(g, x, z, y = 0.065) {
  g.add(part(cyl(0.058, 0.058, 0.036, 18), MAT.castor(), x, y, z, Math.PI / 2, 0, 0));
  g.add(part(cyl(0.022, 0.022, 0.04, 10), MAT.lightGrey(), x, y, z, Math.PI / 2, 0, 0));
  g.add(part(box(0.05, 0.07, 0.05), MAT.lightGrey(), x, y + 0.07, z));
}

/** Five-star rolling base (IV poles, ventilator carts). */
function starBase(g, x, z, reach = 0.28) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = part(rbox(reach, 0.035, 0.05, 0.012), MAT.lightGrey(), x + Math.cos(a) * reach / 2, 0.11, z + Math.sin(a) * reach / 2, 0, -a, 0);
    g.add(leg);
    g.add(part(cyl(0.035, 0.035, 0.025, 12), MAT.castor(), x + Math.cos(a) * reach, 0.04, z + Math.sin(a) * reach, Math.PI / 2, -a, 0));
  }
  g.add(part(cyl(0.05, 0.06, 0.06, 14), MAT.lightGrey(), x, 0.12, z));
}

/* ---------- the bed ---------- */

export function hospitalBed({ kind, occupied, patient }) {
  const g = new THREE.Group();
  const accent = kind === KIND.comfort ? MAT.oak()
    : kind === KIND.emergency ? MAT.darkPlastic()
    : kind === KIND.critical ? MAT.bedTeal()
    : MAT.bedBlue();
  const boards = kind === KIND.comfort ? MAT.plasticWarm() : MAT.plastic();

  // castors + chassis
  for (const x of [0.52, 2.22]) for (const z of [-0.33, 0.33]) castor(g, x, z);
  g.add(part(rbox(1.84, 0.07, 0.62, 0.03), MAT.lightGrey(), 1.37, 0.19, 0));
  g.add(part(rbox(1.62, 0.11, 0.76, 0.04), boards, 1.37, 0.27, 0));           // base cover
  g.add(part(rbox(0.07, 0.03, 0.62, 0.012), MAT.charcoal(), 2.3, 0.11, 0));   // brake pedal bar

  // lift columns
  for (const x of [0.95, 1.8]) g.add(part(rbox(0.15, 0.22, 0.22, 0.03), boards, x, 0.42, 0));

  // deck frame
  g.add(part(rbox(2.04, 0.06, 0.92, 0.02), MAT.lightGrey(), 1.37, 0.505, 0));

  // flat seat + foot mattress
  const seatLen = BED.footX - 0.04 - BED.hingeX;
  g.add(part(rbox(seatLen, BED.mattressT, BED.width, 0.06, 4), MAT.mattress(), BED.hingeX + seatLen / 2, BED.deckY + BED.mattressT / 2, 0));

  // raised head section, hinged at the seat
  const angle = occupied ? THREE.MathUtils.degToRad(kind === KIND.critical ? 30 : 34) : THREE.MathUtils.degToRad(8);
  const head = new THREE.Group();
  head.position.set(BED.hingeX, BED.deckY, 0);
  head.rotation.z = -angle;
  head.add(part(rbox(BED.headLen, BED.mattressT, BED.width, 0.06, 4), MAT.mattress(), -BED.headLen / 2, BED.mattressT / 2, 0));
  head.add(part(rbox(0.42, 0.13, 0.66, 0.06, 4), MAT.pillow(), -BED.headLen + 0.27, BED.mattressT + 0.07, 0, 0, 0, 0.12));
  g.add(head);

  // head- and footboards, with the coloured panel facing outward
  g.add(part(rbox(0.06, 0.62, 0.96, 0.025), boards, BED.headX - 0.02, 0.72, 0));
  g.add(part(rbox(0.015, 0.34, 0.66, 0.006), accent, BED.headX + 0.012, 0.76, 0));
  g.add(part(rbox(0.06, 0.48, 0.96, 0.025), boards, BED.footX, 0.74, 0));
  g.add(part(rbox(0.015, 0.22, 0.7, 0.006), accent, BED.footX + 0.035, 0.76, 0));
  g.add(part(rbox(0.02, 0.05, 0.4, 0.01), MAT.charcoal(), BED.footX + 0.035, 0.93, 0)); // hand grip

  // split side rails, both sides
  for (const s of [-1, 1]) {
    const z = s * 0.49;
    g.add(part(rbox(0.6, 0.26, 0.035, 0.02), boards, 0.78, 0.82, z));
    g.add(part(rbox(0.5, 0.05, 0.01, 0.006), accent, 0.78, 0.84, z + s * 0.018));
    g.add(part(rbox(0.8, 0.24, 0.035, 0.02), boards, 1.66, 0.8, z));
    g.add(part(rbox(0.66, 0.04, 0.01, 0.006), accent, 1.66, 0.81, z + s * 0.018));
    g.add(part(rbox(0.14, 0.08, 0.012, 0.01), MAT.charcoal(), 0.78, 0.76, z + s * 0.02)); // control pad
  }

  let anchors = null;
  if (occupied) anchors = addPatient(g, head, angle, kind, patient);
  else {
    // made-up empty bed: folded blanket at the foot
    const fold = kind === KIND.comfort ? MAT.blanketWarm() : MAT.blanketBlue();
    g.add(part(rbox(0.42, 0.09, 0.86, 0.03), fold, BED.footX - 0.3, BED.deckY + BED.mattressT + 0.045, 0));
    g.add(part(rbox(0.9, 0.012, 0.92, 0.004), MAT.linen(), 1.7, BED.deckY + BED.mattressT + 0.006, 0));
  }

  return { group: g, angle, anchors };
}

/* ---------- the patient ---------- */

/** A capsule spanning two points — upper arms, forearms. */
function limb(a, b, r, material) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const dir = B.clone().sub(A);
  const len = Math.max(0.001, dir.length() - r * 2);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 10), material);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

const SKIN = ['#E8C3A6', '#C99877', '#A8775A', '#7E5038', '#5E3B29', '#F0D2BC'];
const HAIR = ['#2B211B', '#4A3426', '#1A1612', '#8A8580', '#C9C2B8', '#6B4A2E'];

function addPatient(g, head, angle, kind, p) {
  const skin = MAT.skin(SKIN[p.seed % SKIN.length]);
  const hair = MAT.hair(HAIR[(p.seed >>> 2) % HAIR.length]); // unsigned shift: seeds exceed 2^31
  const T = BED.mattressT;

  // torso on the raised section, in a hospital gown
  const torso = part(new THREE.CapsuleGeometry(0.16, 0.36, 6, 14), MAT.gown(), -0.36, T + 0.12, 0, 0, 0, Math.PI / 2);
  torso.scale.set(0.78, 1, 1.32);
  head.add(torso);
  head.add(part(cyl(0.05, 0.055, 0.1, 12), skin, -0.6, T + 0.16, 0, 0, 0, Math.PI / 2));   // neck

  // Head on the pillow. Lying back, the face points away from the backrest
  // (local +y), tipped a little toward the feet — not along the backrest.
  const hx = -0.69, hy = T + 0.24;
  const skull = part(sphere(0.1, 24, 18), skin, hx, hy, 0);
  skull.scale.set(1.08, 0.94, 0.9);
  head.add(skull);
  const dark = MAT.hair('#3A2A22');
  head.add(part(sphere(0.02, 10, 8), skin, hx + 0.045, hy + 0.095, 0));                       // nose
  for (const s of [-1, 1]) {
    head.add(part(sphere(0.022, 10, 8), skin, hx - 0.01, hy + 0.005, s * 0.09));               // ears
    const lid = part(sphere(0.013, 8, 6), dark, hx + 0.005, hy + 0.088, s * 0.033);           // closed eyes
    lid.scale.set(1.5, 0.35, 1);
    head.add(lid);
  }
  const lips = part(sphere(0.012, 8, 6), MAT.paint('#9A5A4C', 0.7), hx + 0.088, hy + 0.068, 0);
  lips.scale.set(0.5, 0.4, 2.2);
  head.add(lips);
  // hair or a theatre cap over the crown and the back of the head, face clear
  const cover = part(sphere(p.cap ? 0.108 : 0.104, 20, 14), p.cap ? MAT.cap() : hair, hx - 0.05, hy - 0.012, 0);
  cover.scale.set(0.82, 0.9, 0.98);
  head.add(cover);

  // blanket over the chest, with the turned-down fold
  const blanket = kind === KIND.comfort ? MAT.blanketWarm() : kind === KIND.ward ? MAT.blanketBlue() : MAT.blanket();
  head.add(part(rbox(0.5, 0.05, 1.0, 0.02), blanket, -0.22, T + 0.27, 0));
  head.add(part(cyl(0.035, 0.035, 0.98, 14), MAT.linen(), -0.46, T + 0.285, 0, Math.PI / 2, 0, 0));

  // Arms at rest: upper arm along the side, elbow bent, forearm angled in so
  // the hands lie on the blanket over the abdomen.
  const armY = T + 0.296;
  for (const s of [-1, 1]) {
    const shoulder = [-0.5, armY + 0.02, s * 0.235];
    const elbow = [-0.2, armY + 0.034, s * 0.272];
    const wrist = [0.04, armY + 0.03, s * 0.15];
    head.add(limb(shoulder, elbow, 0.043, MAT.gown()));
    head.add(limb([elbow[0] - 0.05, elbow[1], elbow[2]], elbow, 0.041, MAT.gown()));
    head.add(limb(elbow, wrist, 0.033, skin));
    const hand = part(sphere(0.04, 12, 10), skin, wrist[0] + 0.045, armY + 0.022, s * 0.13);
    hand.scale.set(1.35, 0.55, 0.9);
    head.add(hand);
  }

  // legs under the blanket on the flat section
  const legY = BED.deckY + T + 0.085;
  for (const s of [-1, 1]) {
    g.add(part(new THREE.CapsuleGeometry(0.085, 0.86, 4, 12), MAT.linen(), BED.hingeX + 0.62, legY, s * 0.11, 0, 0, Math.PI / 2));
  }
  // blanket across the legs, draped over both sides and the foot
  const top = legY + 0.1;
  g.add(part(rbox(1.34, 0.035, 1.02, 0.015), blanket, BED.hingeX + 0.64, top, 0));
  for (const s of [-1, 1]) g.add(part(rbox(1.3, 0.2, 0.02, 0.01), blanket, BED.hingeX + 0.64, top - 0.11, s * 0.5));
  g.add(part(rbox(0.02, 0.2, 1.0, 0.01), blanket, BED.footX - 0.06, top - 0.11, 0));
  // feet lift the blanket at the end
  for (const s of [-1, 1]) { const f = part(sphere(0.06, 12, 10), blanket, BED.footX - 0.24, top + 0.012, s * 0.11); f.scale.set(1.2, 0.55, 1); g.add(f); }

  // where the airway lines meet the face (ventilator circuit, nasal cannula)
  const mouth = headToUnit(hx + 0.1, hy + 0.075, angle);
  const nose = headToUnit(hx + 0.05, hy + 0.115, angle);
  const hand = headToUnit(0.085, T + 0.318, angle);
  hand.z = 0.13;
  return { mouth, nose, hand };
}

/* ---------- the headwall ---------- */

/**
 * Bed-head services panel (the trunking in every reference photo): medical
 * gas outlets, a flowmeter, a suction jar, sockets, a reading light, the red
 * bed plaque and the identification board.
 */
export function headwall({ bedNumber, unitName, header, hue, kind, own = [] }) {
  const g = new THREE.Group();
  const y = 1.32;
  g.add(part(rbox(0.07, 0.17, 2.0, 0.02), MAT.plastic(), 0.035, y, 0));
  g.add(part(rbox(0.075, 0.03, 2.0, 0.01), kind === KIND.comfort ? MAT.oak() : MAT.lightGrey(), 0.04, y + 0.1, 0));

  // gases: oxygen (white), medical air (black/white), vacuum (yellow)
  const gases = [['#FFFFFF', -0.62], ['#2A2E33', -0.48], ['#E9C23F', -0.34]];
  for (const [c, z] of gases) {
    g.add(part(cyl(0.032, 0.032, 0.03, 18), MAT.paint(c, 0.4), 0.085, y, z, 0, 0, Math.PI / 2));
    g.add(part(cyl(0.014, 0.014, 0.032, 10), MAT.chrome(), 0.098, y, z, 0, 0, Math.PI / 2));
  }
  // oxygen flowmeter
  g.add(part(cyl(0.018, 0.018, 0.13, 14), MAT.glassClear(), 0.12, y + 0.06, -0.62));
  g.add(part(sphere(0.008, 8, 6), MAT.green(), 0.12, y + 0.07, -0.62));
  g.add(part(cyl(0.02, 0.02, 0.02, 14), MAT.chrome(), 0.12, y + 0.135, -0.62));
  // suction jar
  g.add(part(rbox(0.06, 0.05, 0.08, 0.01), MAT.lightGrey(), 0.1, y - 0.12, -0.34));
  g.add(part(cyl(0.055, 0.05, 0.17, 18), MAT.glassClear(), 0.13, y - 0.24, -0.34));
  g.add(part(cyl(0.058, 0.058, 0.025, 18), MAT.paint('#3D7FC0', 0.5), 0.13, y - 0.145, -0.34));

  // sockets
  for (const z of [0.38, 0.54, 0.7]) {
    g.add(part(rbox(0.012, 0.075, 0.075, 0.008), MAT.plastic(), 0.077, y, z));
    for (const d of [-0.012, 0.012]) g.add(part(box(0.006, 0.012, 0.005), MAT.charcoal(), 0.084, y + 0.005, z + d));
  }

  // reading light over the bed
  g.add(part(rbox(0.1, 0.07, 0.9, 0.02), MAT.plastic(), 0.05, 2.3, 0));
  g.add(part(box(0.002, 0.03, 0.82), MAT.ledWarm(), 0.101, 2.29, 0));

  // red bed plaque and identification board
  const plaque = part(plane(0.3, 0.112), texMat(TX.bedPlaque(bedNumber), { roughness: 0.4 }), 0.012, 2.03, -0.62, 0, Math.PI / 2, 0);
  g.add(plaque);
  g.add(part(rbox(0.02, 0.45, 0.67, 0.01), MAT.lightGrey(), 0.01, 1.68, -0.62));
  // unique per bed, so owned (and later disposed) by the ward, not the shared cache
  const boardTex = TX.idBoard({ bed: bedNumber, unit: unitName, header, hue });
  const boardMat = new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.55 });
  own.push(boardTex, boardMat);
  g.add(part(plane(0.64, 0.427), boardMat, 0.021, 1.68, -0.62, 0, Math.PI / 2, 0));

  return g;
}

/** Wall-arm patient monitor; the screen is a live canvas texture. */
export function wallMonitor(liveTex, big = false) {
  const g = new THREE.Group();
  const w = big ? 0.5 : 0.42, h = big ? 0.32 : 0.27;
  g.add(part(rbox(0.04, 0.16, 0.12, 0.01), MAT.lightGrey(), 0.02, 1.86, 0.45));
  g.add(part(rbox(0.3, 0.045, 0.05, 0.015), MAT.lightGrey(), 0.17, 1.86, 0.45));
  const head = new THREE.Group();
  head.position.set(0.34, 1.86, 0.45);
  head.rotation.set(0, -0.32, -0.12);
  head.add(part(rbox(0.07, h + 0.05, w + 0.05, 0.02), MAT.plastic(), 0, 0, 0));
  head.add(part(plane(w, h), screenMat(liveTex), 0.0355, 0, 0, 0, Math.PI / 2, 0));
  head.add(part(rbox(0.012, 0.025, 0.08, 0.005), MAT.charcoal(), 0.037, -h / 2 - 0.012, w / 2 - 0.06));
  g.add(head);
  return g;
}

/* ---------- mobile equipment ---------- */

export function ivPole({ x = 0.62, z = 0.74, pumps = 1, bag = true, lineTo = null }) {
  const g = new THREE.Group();
  starBase(g, x, z, 0.26);
  g.add(part(cyl(0.013, 0.013, 1.95, 10), MAT.chrome(), x, 1.08, z));
  for (const a of [0, Math.PI / 2]) g.add(part(cyl(0.006, 0.006, 0.2, 8), MAT.chrome(), x, 2.04, z, 0, a, Math.PI / 2));
  if (bag) {
    g.add(part(rbox(0.12, 0.21, 0.035, 0.015), MAT.ivBag(), x + 0.08, 1.88, z));
    g.add(part(cyl(0.01, 0.01, 0.06, 8), MAT.glassClear(), x + 0.08, 1.74, z));
    if (lineTo) {
      g.add(new THREE.Mesh(tube([[x + 0.08, 1.71, z], [x + 0.1, 1.3, z - 0.05], [lineTo.x - 0.1, lineTo.y + 0.25, lineTo.z + 0.1], [lineTo.x, lineTo.y, lineTo.z]], 0.004, 50), MAT.glassClear()));
    }
  }
  const scr = screenMat(TX.pumpScreen(), 0.9);
  for (let i = 0; i < pumps; i++) {
    const py = 1.05 + i * 0.15;
    g.add(part(rbox(0.1, 0.13, 0.19, 0.015), MAT.plastic(), x + 0.07, py, z));
    g.add(part(plane(0.07, 0.035), scr, x + 0.121, py + 0.025, z - 0.04, 0, Math.PI / 2, 0));
    g.add(part(box(0.004, 0.02, 0.06), MAT.charcoal(), x + 0.121, py - 0.03, z + 0.03));
    g.add(part(cyl(0.012, 0.012, 0.08, 8), MAT.lightGrey(), x + 0.02, py, z, 0, 0, Math.PI / 2));
  }
  return g;
}

/** Ventilator on its cart, touchscreen turned toward the bed foot, circuit to the patient. */
export function ventilator({ x = 1.0, z = 0.98, to }) {
  const g = new THREE.Group();
  starBase(g, x, z, 0.3);
  g.add(part(cyl(0.035, 0.035, 0.8, 12), MAT.plastic(), x, 0.55, z));
  g.add(part(rbox(0.36, 0.34, 0.3, 0.04), MAT.plastic(), x, 1.02, z));
  g.add(part(rbox(0.3, 0.05, 0.26, 0.02), MAT.paint('#7FA6BC', 0.5), x, 0.86, z));
  // articulated screen arm
  g.add(part(cyl(0.015, 0.015, 0.22, 8), MAT.lightGrey(), x, 1.3, z));
  const scr = new THREE.Group();
  scr.position.set(x + 0.05, 1.46, z);
  scr.rotation.set(0, -0.55, -0.18);
  scr.add(part(rbox(0.05, 0.3, 0.4, 0.02), MAT.plastic(), 0, 0, 0));
  scr.add(part(plane(0.36, 0.27), screenMat(TX.ventScreen(), 1.0), 0.026, 0, 0, 0, Math.PI / 2, 0));
  g.add(scr);
  // breathing circuit
  if (to) {
    const hose = MAT.paint('#D9E8F0', 0.35);
    // inspiratory and expiratory limbs, sagging under their own weight
    // between the cart and a support arm, then rising to the patient
    for (const [dz, sag] of [[0, 0], [0.06, 0.05]]) {
      g.add(new THREE.Mesh(tube([
        [x - 0.12, 0.98 - sag, z - 0.08 + dz],
        [x - 0.3, 0.74 - sag, z - 0.32 + dz],
        [to.x + 0.42, to.y - 0.22 - sag, to.z + 0.42 + dz],
        [to.x + 0.16, to.y - 0.02, to.z + 0.16 + dz],
        [to.x + 0.05, to.y, to.z + 0.04 + dz * 0.3],
      ], 0.015, 70), hose));
    }
    g.add(part(cyl(0.012, 0.012, 0.09, 8), MAT.glassClear(), to.x + 0.04, to.y, to.z, 0, 0, Math.PI / 2));
  }
  return g;
}

/** Nasal cannula from the patient's nose to the oxygen flowmeter. */
export function cannula(nose) {
  const m = MAT.paint('#E6F2F3', 0.3);
  return new THREE.Mesh(tube([[nose.x + 0.02, nose.y - 0.02, 0], [nose.x - 0.05, nose.y - 0.02, 0.09], [nose.x - 0.25, nose.y - 0.2, 0.35], [0.4, 1.0, -0.4], [0.12, 1.36, -0.62]], 0.0035, 60), m);
}

/* ---------- bedside furniture ---------- */

export function locker({ x = 0.5, z = -0.9, kind }) {
  const g = new THREE.Group();
  const front = kind === KIND.comfort ? MAT.oak() : kind === KIND.critical ? MAT.lockerTeal() : MAT.lockerBlue();
  g.add(part(rbox(0.46, 0.8, 0.46, 0.02), MAT.laminate(), x, 0.44, z));
  g.add(part(rbox(0.012, 0.14, 0.4, 0.01), front, x + 0.235, 0.71, z));
  g.add(part(rbox(0.012, 0.44, 0.4, 0.01), front, x + 0.235, 0.36, z));
  g.add(part(rbox(0.02, 0.012, 0.14, 0.005), MAT.chrome(), x + 0.245, 0.71, z));
  g.add(part(rbox(0.02, 0.1, 0.012, 0.005), MAT.chrome(), x + 0.245, 0.42, z + 0.14));
  g.add(part(rbox(0.5, 0.025, 0.5, 0.01), MAT.laminate(), x, 0.86, z));
  for (const dx of [-0.17, 0.17]) for (const dz of [-0.17, 0.17]) g.add(part(cyl(0.025, 0.025, 0.04, 10), MAT.castor(), x + dx, 0.025, z + dz));
  // water jug and cup
  g.add(part(cyl(0.05, 0.055, 0.2, 16), MAT.glassClear(), x - 0.08, 0.97, z - 0.05));
  g.add(part(cyl(0.035, 0.03, 0.09, 14), MAT.plastic(), x + 0.1, 0.92, z + 0.08));
  return g;
}

export function overbedTable({ x = 1.78, z = 0.72 }) {
  const g = new THREE.Group();
  g.add(part(rbox(0.6, 0.04, 0.06, 0.015), MAT.lightGrey(), x, 0.06, z));
  for (const dx of [-0.27, 0.27]) g.add(part(cyl(0.025, 0.025, 0.035, 10), MAT.castor(), x + dx, 0.022, z));
  g.add(part(rbox(0.05, 0.86, 0.05, 0.015), MAT.lightGrey(), x, 0.5, z + 0.02));
  g.add(part(rbox(0.44, 0.03, 0.8, 0.015), MAT.laminate(), x, 0.96, z - 0.36));
  g.add(part(rbox(0.46, 0.02, 0.82, 0.01), MAT.lightGrey(), x, 0.94, z - 0.36));
  g.add(part(cyl(0.032, 0.028, 0.09, 14), MAT.plastic(), x - 0.08, 1.02, z - 0.2));
  g.add(part(rbox(0.22, 0.012, 0.28, 0.004), MAT.paint('#FBFBF8', 0.9), x + 0.05, 0.98, z - 0.5));
  return g;
}

export function armchair({ x = 1.6, z = -1.08, color = '#4F7F86' }) {
  const g = new THREE.Group();
  const up = MAT.upholstery(color);
  g.add(part(rbox(0.6, 0.14, 0.56, 0.05), up, x, 0.47, z));
  const back = part(rbox(0.6, 0.66, 0.14, 0.05), up, x, 0.82, z - 0.27, -0.14, 0, 0);
  g.add(back);
  for (const s of [-1, 1]) {
    g.add(part(rbox(0.1, 0.24, 0.56, 0.04), up, x + s * 0.33, 0.62, z));
    g.add(part(rbox(0.08, 0.03, 0.5, 0.015), MAT.oak(), x + s * 0.33, 0.75, z));
  }
  for (const dx of [-0.26, 0.26]) for (const dz of [-0.22, 0.22]) g.add(part(cyl(0.022, 0.018, 0.4, 10), MAT.oak(), x + dx, 0.2, z + dz));
  return g;
}

export function plant({ x, z, h = 1.0 }) {
  const g = new THREE.Group();
  g.add(part(cyl(0.16, 0.12, 0.34, 18), MAT.paint('#E8E3D8', 0.6), x, 0.17, z));
  g.add(part(cyl(0.15, 0.15, 0.02, 18), MAT.soil(), x, 0.33, z));
  const r = (n) => Math.sin(n * 12.9898) * 0.5 + 0.5;
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, rr = 0.05 + r(i) * 0.12, y = 0.5 + r(i + 3) * (h - 0.5);
    const leaf = part(sphere(0.14 + r(i + 7) * 0.08, 10, 8), MAT.leaf(), x + Math.cos(a) * rr, y, z + Math.sin(a) * rr);
    leaf.scale.set(1, 0.7, 1);
    g.add(leaf);
  }
  g.add(part(cyl(0.012, 0.016, h - 0.3, 6), MAT.paint('#5A4632', 0.9), x, 0.33 + (h - 0.3) / 2, z));
  return g;
}

/** Resuscitation trolley — red drawers, defibrillator on top. */
export function crashCart({ x, z, ry = 0 }) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  inner.add(part(rbox(0.62, 0.92, 0.5, 0.03), MAT.red(), 0, 0.56, 0));
  for (let i = 0; i < 5; i++) inner.add(part(rbox(0.012, 0.012, 0.42, 0.004), MAT.paint('#8E1F1A', 0.5), 0.312, 0.24 + i * 0.16, 0));
  inner.add(part(rbox(0.66, 0.04, 0.54, 0.015), MAT.lightGrey(), 0, 1.04, 0));
  inner.add(part(rbox(0.3, 0.2, 0.28, 0.03), MAT.paint('#E7B53C', 0.45), -0.05, 1.16, 0));
  inner.add(part(plane(0.14, 0.09), screenMat(TX.pumpScreen(), 0.8), 0.1, 1.2, 0, 0, Math.PI / 2, 0));
  for (const dx of [-0.24, 0.24]) for (const dz of [-0.2, 0.2]) inner.add(part(cyl(0.04, 0.04, 0.03, 12), MAT.castor(), dx, 0.05, dz, Math.PI / 2, 0, 0));
  inner.position.set(x, 0, z);
  inner.rotation.y = ry;
  g.add(inner);
  return g;
}

/** Lead aprons on a wall rack — the cath and EP labs' signature fixture. */
export function apronRack({ x, z, ry = 0 }) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  inner.add(part(rbox(0.05, 0.06, 1.3, 0.01), MAT.chrome(), 0, 1.75, 0));
  const colors = ['#2F5E9E', '#7C3B6A', '#2E7D6A', '#3A3F46', '#A2532F'];
  colors.forEach((c, i) => {
    const a = part(rbox(0.05, 0.95, 0.52, 0.04), MAT.paint(c, 0.7), 0.04, 1.25, -0.5 + i * 0.25, 0, 0, 0.04);
    inner.add(a);
  });
  inner.position.set(x, 0, z);
  inner.rotation.y = ry;
  g.add(inner);
  return g;
}
