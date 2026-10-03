import * as THREE from 'three';
import { MAT, cyl, sphere, rbox, part, tube } from './kit.js';
import * as TX from './textures.js';
import { BED, headToUnit } from './bedFrame.js';
import { getPatientAssets, LANDMARK } from './patientAssets.js';
import { KIND } from '../data.js';

/* ============================================================
   THE PATIENT
   A person lying back on the raised bed: a 3D-scanned head on the
   pillow, a printed gown over the shoulders, arms resting with the
   hands on the abdomen, and a blanket that drapes over the actual
   shape of a body — hips, legs, knees, the tent of the feet — and
   hangs over the sides of the mattress.

   Two frames are in play: `head` is the raised backrest (x runs
   from the head end toward the hinge, y away from the backrest),
   `g` is the bed unit. Cables that cross both are built in `g`.
   ============================================================ */

const T = BED.mattressT;
const SCALE = 0.052;                    // scan units → metres (≈ 23 cm chin to crown)
const PILLOW_TOP = T + 0.14;

/* Six skin tones, applied as a tint over the scan's own skin texture. */
const TINT = ['#FFFFFF', '#F3DECD', '#DDB394', '#BC8869', '#925E42', '#6C432E'];
const HAIR = ['#2A211B', '#8E8984', '#4B3527', '#141110'];

const scanMats = new Map();
function scanSkin(assets, tint) {
  if (!scanMats.has(tint)) {
    scanMats.set(tint, new THREE.MeshStandardMaterial({
      map: assets.color, normalMap: assets.normal, normalScale: new THREE.Vector2(0.75, 0.75),
      color: new THREE.Color(tint), roughness: 0.52,
    }));
  }
  return scanMats.get(tint);
}
const hairMats = new Map();
function hairMat(tone) {
  if (!hairMats.has(tone)) {
    hairMats.set(tone, new THREE.MeshStandardMaterial({ map: TX.hairStrands(tone), roughness: 0.78 }));
  }
  return hairMats.get(tone);
}
let capMat = null;
const fabricCap = () => (capMat ||= new THREE.MeshStandardMaterial({ map: TX.capFabric(), roughness: 0.9 }));
let maskM = null;
const maskMat = () => (maskM ||= new THREE.MeshPhysicalMaterial({ color: '#D9F0E3', roughness: 0.25, transparent: true, opacity: 0.72, side: THREE.DoubleSide }));
let gownMat = null;
let trimMat = null;
const gownTrim = () => (trimMat ||= new THREE.MeshStandardMaterial({ map: TX.gownPrint(), roughness: 0.88, side: THREE.DoubleSide }));
const gown = () => (gownMat ||= new THREE.MeshStandardMaterial({ map: TX.gownPrint(), roughness: 0.88 }));
const blanketMats = new Map();
let drapeM = null;
function blanketMat(kind) {
  if (kind === 'cathlab') {
    return (drapeM ||= new THREE.MeshStandardMaterial({ map: TX.sterileDrape(), roughness: 0.95, side: THREE.DoubleSide }));
  }
  const tone = kind === KIND.comfort ? '#E8DBC4' : kind === KIND.ward ? '#D3E3EF' : '#F0F3F4';
  if (!blanketMats.has(tone)) {
    blanketMats.set(tone, new THREE.MeshStandardMaterial({ map: TX.cellularBlanket(tone), roughness: 0.96, side: THREE.DoubleSide }));
  }
  return blanketMats.get(tone);
}

/* ---------- body shape under the blanket ---------- */

const ell = (d, w) => { const q = 1 - d * d / (w * w); return q > 0 ? Math.sqrt(q) : 0; };

/** Height of the body above the flat (seat/leg) mattress, u from the hinge. */
function legBody(u, z) {
  let h = 0;
  // pelvis and hips
  h = Math.max(h, 0.15 * ell(u - 0.04, 0.22) * ell(z, 0.21));
  for (const s of [-1, 1]) {
    // thighs taper toward the knee, which rides a little high
    if (u > 0.05 && u < 0.6) {
      const k = (u - 0.05) / 0.55;
      const hh = 0.145 - 0.035 * k + 0.02 * Math.exp(-((u - 0.56) ** 2) / 0.003);
      h = Math.max(h, hh * ell(z - s * 0.105, 0.09 - 0.015 * k));
    }
    // shins
    if (u >= 0.55 && u < 1.08) {
      const k = (u - 0.55) / 0.53;
      h = Math.max(h, (0.115 - 0.035 * k) * ell(z - s * 0.098, 0.07 - 0.012 * k));
    }
    // feet: toes up, tenting the blanket at the end of the bed
    if (u >= 1.0 && u < 1.25) {
      const rise = u < 1.15 ? (u - 1.0) / 0.15 : 1 - (u - 1.15) / 0.1;
      h = Math.max(h, (0.08 + 0.11 * Math.max(0, rise)) * ell(z - s * 0.1, 0.055));
    }
  }
  return h;
}

/** Height of the torso above the raised backrest, x in the head frame. */
function torsoBody(x, z) {
  return Math.max(
    0.15 * ell(x + 0.12, 0.33) * ell(z, 0.205),       // chest and abdomen
    0.12 * ell(x - 0.02, 0.2) * ell(z, 0.19),         // belly toward the hinge
  );
}

/**
 * A blanket over `body`: at every point, the highest of the body heights
 * nearby less a tension term — so it bridges between the legs instead of
 * dipping into the gap, and falls away over the mattress edges.
 */
function drape({ u0, u1, nu, nz, body, edgeU = Infinity, lift = 0.012 }) {
  const zHalf = 0.64, mattHalf = BED.width / 2;
  const K = 7, Kfoot = 9;
  const H = [];
  for (let i = 0; i <= nu; i++) {
    const u = u0 + (u1 - u0) * i / nu;
    const row = [];
    // body heights across the mattress at this u
    const samples = [];
    for (let k = 0; k <= 36; k++) {
      const zz = -mattHalf + (2 * mattHalf) * k / 36;
      samples.push([zz, body(Math.min(u, edgeU), zz)]);
    }
    for (let j = 0; j <= nz; j++) {
      const z = -zHalf + 2 * zHalf * j / nz;
      let best = -1;
      for (const [zz, hh] of samples) best = Math.max(best, hh - K * (z - zz) ** 2);
      if (u > edgeU) best -= Kfoot * (u - edgeU) ** 2 + 0.6 * (u - edgeU);
      row.push(Math.max(best, -0.26) + lift);
    }
    H.push(row);
  }
  // soften along the bed so body parts flow into each other
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i < nu; i++) for (let j = 0; j <= nz; j++) {
      H[i][j] = (H[i - 1][j] + 2 * H[i][j] + H[i + 1][j]) / 4;
    }
  }
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nz; j++) {
    const u = u0 + (u1 - u0) * i / nu, z = -zHalf + 2 * zHalf * j / nz;
    pos.push(u, H[i][j], z);
    uv.push(i / nu * ((u1 - u0) / 1.3), j / nz);
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nz; j++) {
    const a = i * (nz + 1) + j, b = a + nz + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return { geo, heightAt: (u, z) => sampleGrid(H, u0, u1, nu, nz, zHalf, u, z) };
}

function sampleGrid(H, u0, u1, nu, nz, zHalf, u, z) {
  const fi = Math.max(0, Math.min(nu, (u - u0) / (u1 - u0) * nu));
  const fj = Math.max(0, Math.min(nz, (z + zHalf) / (2 * zHalf) * nz));
  const i = Math.min(nu - 1, Math.floor(fi)), j = Math.min(nz - 1, Math.floor(fj));
  const a = fi - i, b = fj - j;
  return (H[i][j] * (1 - a) + H[i + 1][j] * a) * (1 - b) + (H[i][j + 1] * (1 - a) + H[i + 1][j + 1] * a) * b;
}

/* ---------- limbs ---------- */

/** A tapered limb between two points, with rounded ends. */
function limb(a, b, r0, r1, material) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const dir = B.clone().sub(A);
  const len = dir.length();
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 14, 1, true), material);
  shaft.position.copy(A).add(B).multiplyScalar(0.5);
  shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  g.add(shaft);
  g.add(part(sphere(r0, 14, 10), material, ...a));
  g.add(part(sphere(r1, 14, 10), material, ...b));
  return g;
}

/**
 * A relaxed hand at `wrist`, fingers pointing along `dir`, back of the hand
 * facing `up`. Returns the group and the fingertip of the index finger.
 */
function hand(wrist, dir, up, skin, side) {
  const g = new THREE.Group();
  const x = dir.clone().normalize();
  const z = new THREE.Vector3().crossVectors(x, up).normalize();
  const y = new THREE.Vector3().crossVectors(z, x).normalize();
  g.matrixAutoUpdate = true;
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  g.position.copy(wrist);

  const palm = part(rbox(0.085, 0.026, 0.078, 0.012), skin, 0.05, 0, 0);
  g.add(palm);
  const fingers = [[0.026, 0.066], [0.009, 0.074], [-0.009, 0.07], [-0.026, 0.056]];
  let tip = null;
  fingers.forEach(([dz, len], i) => {
    const f = new THREE.Group();
    f.position.set(0.09, -0.004, dz * side);
    f.rotation.z = -0.18 - i * 0.03;                  // relaxed curl toward the blanket
    f.add(part(new THREE.CapsuleGeometry(0.0085, len - 0.017, 3, 8), skin, len / 2, 0, 0, 0, 0, Math.PI / 2));
    g.add(f);
    if (i === 1) tip = f;
  });
  const thumb = new THREE.Group();
  thumb.position.set(0.035, -0.006, -0.04 * side);
  thumb.rotation.set(0, 0.7 * side, -0.25);
  thumb.add(part(new THREE.CapsuleGeometry(0.01, 0.042, 3, 8), skin, 0.028, 0, 0, 0, 0, Math.PI / 2));
  g.add(thumb);
  g.updateMatrixWorld(true);
  const tipPos = new THREE.Vector3(0.075 - 0.01, 0, 0);
  tip.updateMatrixWorld(true);
  return { group: g, indexTip: tip.localToWorld(tipPos.clone()), back: new THREE.Vector3(0.05, 0.016, 0).applyMatrix4(g.matrix) };
}

/* ---------- the head ---------- */

function scannedHead(headGroup, assets, p, tint) {
  const m = new THREE.Mesh(assets.head, scanSkin(assets, tint));
  // scan axes → backrest frame: crown toward the head of the bed, face up
  const basis = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 0, -1),   // scan x (ear to ear)
    new THREE.Vector3(-1, 0, 0),   // scan y (chin to crown)
    new THREE.Vector3(0, 1, 0),    // scan z (back to face)
  );
  const q = new THREE.Quaternion().setFromRotationMatrix(basis);
  // a little turn of the head toward one side, and the chin lifted slightly
  const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), p.roll);
  const nod = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.08);
  m.quaternion.copy(roll).multiply(nod).multiply(q);
  m.scale.setScalar(SCALE);
  // rest the back of the skull on the pillow, crown near its top edge
  m.position.set(-0.46, PILLOW_TOP + -LANDMARK.backZ * SCALE - 0.012, 0);
  m.userData.keep = true;
  m.castShadow = true;
  m.receiveShadow = true;
  headGroup.add(m);
  m.updateMatrix();

  const toHead = v => v.clone().applyMatrix4(m.matrix);
  if (p.hair === 'cap' || p.hair) {
    const capped = p.hair === 'cap';
    const h = new THREE.Mesh(capped ? assets.cap : assets.hair, capped ? fabricCap() : hairMat(p.hair));
    h.position.copy(m.position); h.quaternion.copy(m.quaternion); h.scale.copy(m.scale);
    h.userData.keep = true;
    h.castShadow = true;
    headGroup.add(h);
  }

  const faceDir = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion);
  return {
    nose: toHead(LANDMARK.nose),
    mouth: toHead(LANDMARK.mouth),
    neck: toHead(new THREE.Vector3(-0.09, LANDMARK.neckCutY + 0.02, -0.3)),
    neckAxis: new THREE.Vector3(0, 1, 0).applyQuaternion(m.quaternion),   // toward the crown
    faceDir,
  };
}

/** Used only if the scan could not be loaded: a simple modelled head. */
function modelledHead(headGroup, skin, p) {
  const hx = -0.69, hy = T + 0.24;
  const skull = part(sphere(0.1, 24, 18), skin, hx, hy, 0);
  skull.scale.set(1.08, 0.94, 0.9);
  headGroup.add(skull);
  headGroup.add(part(sphere(0.02, 10, 8), skin, hx + 0.045, hy + 0.095, 0));
  const cover = part(sphere(0.104, 20, 14), p.hair === 'cap' ? fabricCap() : MAT.hair(p.hair || '#2A211B'), hx - 0.05, hy - 0.012, 0);
  cover.scale.set(0.82, 0.9, 0.98);
  headGroup.add(cover);
  return {
    nose: new THREE.Vector3(hx + 0.05, hy + 0.115, 0),
    mouth: new THREE.Vector3(hx + 0.1, hy + 0.075, 0),
    neck: new THREE.Vector3(-0.6, T + 0.16, 0),
    neckAxis: new THREE.Vector3(-1, 0, 0),
    faceDir: new THREE.Vector3(0.3, 1, 0).normalize(),
  };
}

/* ---------- the whole patient ---------- */

/**
 * Lay a patient in the bed. `support` is the airway: 'vent' (intubated),
 * 'mask', 'cannula' or 'none'. Returns attachment points in the bed unit
 * frame for the ward's IV pole, ventilator and oxygen lines.
 */
export function buildPatient(g, head, angle, kind, p) {
  const assets = getPatientAssets();
  const tint = TINT[p.seed % TINT.length];
  const skinTone = (assets ? assets.skin.clone() : new THREE.Color('#C99877')).offsetHSL(0, -0.12, 0.05).multiply(new THREE.Color(tint));
  const skin = MAT.skin('#' + skinTone.getHexString());
  const hairChoice = p.cap ? 'cap' : [null, HAIR[0], HAIR[1], HAIR[2], HAIR[3]][(p.seed >>> 3) % 5];
  const person = { seed: p.seed, roll: ((p.seed >>> 5) % 7 - 3) * 0.06, hair: hairChoice };

  const face = assets ? scannedHead(head, assets, person, tint) : modelledHead(head, skin, person);

  /* gowned shoulders and upper chest, above the fold of the blanket */
  const chest = part(sphere(1, 28, 18), gown(), -0.29, T + 0.05, 0);
  chest.scale.set(0.16, 0.15, 0.21);
  head.add(chest);
  head.add(limb([-0.33, T + 0.11, -0.13], [-0.33, T + 0.11, 0.13], 0.072, 0.072, gown()));
  // The gown's neckline: a short flared band that rises around the base of
  // the neck — it closes over the trimmed edge of the scan from every angle.
  const axis = face.neckAxis.clone().normalize();
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.1, 0.055, 30, 1, true), gownTrim());
  band.position.copy(face.neck).addScaledVector(axis, -0.024);
  band.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
  head.add(band);
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.0045, 8, 30), MAT.paint('#7C9CBB', 0.7));
  hem.position.copy(face.neck).addScaledVector(axis, 0.003);
  hem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);
  head.add(hem);

  /* blanket over the torso, with the white sheet turned down over it */
  const blanket = blanketMat(kind);
  const fold = -0.27;
  const top = drape({ u0: fold, u1: 0.02, nu: 26, nz: 34, body: torsoBody, lift: 0.014 });
  const topMesh = new THREE.Mesh(top.geo, blanket);
  topMesh.position.y = T;
  head.add(topMesh);
  const cuffPts = [];
  for (let k = 0; k <= 24; k++) {
    const z = -0.6 + 1.2 * k / 24;
    cuffPts.push([fold + 0.006, T + top.heightAt(fold + 0.01, z) + 0.012, z]);
  }
  if (!p.table) head.add(new THREE.Mesh(tube(cuffPts, 0.02, 48), MAT.linen()));

  /* blanket over the legs, draped over the sides and the foot */
  const legs = drape({ u0: -0.02, u1: 1.42, nu: 64, nz: 40, body: legBody, edgeU: 1.32 });
  const legMesh = new THREE.Mesh(legs.geo, blanket);
  legMesh.position.set(BED.hingeX, BED.deckY + T, 0);
  g.add(legMesh);

  /* arms: sleeve, upper arm, forearm onto the abdomen, hands at rest */
  const anchors = {};
  for (const s of [-1, 1]) {
    if (p.table && s === 1) { radialArm(g, head, skin, anchors); continue; }
    const onSheet = (x, z, r) => T + Math.max(top.heightAt(x, z), torsoBody(x, z) * 0.9) + r * 0.9;
    const shoulder = [-0.34, T + 0.1, s * 0.205];
    const elbow = [-0.11, onSheet(-0.11, s * 0.262, 0.036), s * 0.262];
    const wrist = [-0.075, onSheet(-0.075, s * 0.14, 0.03) + 0.012, s * 0.14];
    const mid = [shoulder[0] * 0.55 + elbow[0] * 0.45, shoulder[1] * 0.55 + elbow[1] * 0.45, shoulder[2] * 0.55 + elbow[2] * 0.45];
    head.add(limb(shoulder, mid, 0.056, 0.05, gown()));            // short gown sleeve
    head.add(limb(shoulder, elbow, 0.043, 0.037, skin));
    head.add(limb(elbow, wrist, 0.036, 0.028, skin));
    // the hand lies across the abdomen, pointing in toward the midline
    const dir = new THREE.Vector3(0.55, 0, -s * 1).normalize();
    const h = hand(new THREE.Vector3(...wrist), dir, new THREE.Vector3(0, 1, 0), skin, s);
    head.add(h.group);

    if (s < 0) {
      // patient ID wristband, and the pulse oximeter on the index finger
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.006, 6, 20), MAT.plastic());
      band.position.set(wrist[0] - dir.x * 0.03, wrist[1] - dir.y * 0.03, wrist[2] - dir.z * 0.03);
      band.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      head.add(band);
      head.add(part(rbox(0.032, 0.024, 0.024, 0.008), MAT.paint('#3E6FB0', 0.5), h.indexTip.x, h.indexTip.y + 0.004, h.indexTip.z));
      anchors.finger = headToUnit(h.indexTip.x, h.indexTip.y + 0.004, angle, h.indexTip.z);
    } else {
      // peripheral cannula on the back of the hand, under a clear dressing
      head.add(part(rbox(0.04, 0.005, 0.032, 0.002), MAT.glassClear(), h.back.x, h.back.y + 0.002, h.back.z));
      head.add(part(cyl(0.006, 0.006, 0.03, 8), MAT.paint('#E6B33A', 0.4), h.back.x + 0.01, h.back.y + 0.008, h.back.z, 0, 0, Math.PI / 2));
      anchors.hand = headToUnit(h.back.x + 0.025, h.back.y + 0.008, angle, h.back.z);
    }
  }

  /* monitoring leads: three electrodes under the gown, into one cable */
  const lead = [['#FFFFFF', -0.07], ['#1E1E1E', 0.07], ['#C8302A', 0.11]];
  const join = headToUnit(-0.2, T + 0.3, angle, 0.34);
  for (const [c, z] of lead) {
    const from = headToUnit(-0.3, T + 0.19, angle, z);
    g.add(new THREE.Mesh(tube([[from.x, from.y, from.z], [from.x + 0.02, from.y + 0.06, (from.z + join.z) / 2], [join.x, join.y, join.z]], 0.0028, 24), MAT.paint(c, 0.5)));
  }
  const f = anchors.finger;
  if (p.table) {
    // on the table the leads drop over the far edge to the lab's recording system
    g.add(new THREE.Mesh(tube([[join.x, join.y, join.z], [join.x + 0.1, join.y - 0.05, -0.6], [join.x + 0.15, BED.deckY - 0.3, -0.72]], 0.004, 30), MAT.lightGrey()));
    if (f) g.add(new THREE.Mesh(tube([[f.x, f.y, f.z], [f.x + 0.05, f.y + 0.02, f.z - 0.2], [f.x + 0.1, BED.deckY - 0.3, -0.72]], 0.0032, 30), MAT.lightGrey()));
  } else {
    g.add(new THREE.Mesh(tube([[join.x, join.y, join.z], [join.x - 0.1, join.y + 0.25, 0.45], [0.42, 1.55, 0.5], [0.34, 1.72, 0.45]], 0.004, 40), MAT.lightGrey()));
    // the oximeter cable runs up to the same monitor
    g.add(new THREE.Mesh(tube([[f.x, f.y, f.z], [f.x - 0.1, f.y + 0.08, f.z - 0.12], [0.62, 0.98, -0.47], [0.3, 1.25, -0.2], [0.34, 1.72, 0.4]], 0.0032, 48), MAT.lightGrey()));
  }

  /* the airway */
  const mouth = face.mouth.clone();
  const out = face.faceDir.clone();
  if (p.support === 'vent') {
    // endotracheal tube, taped at the mouth, turned toward the ventilator side
    const a = mouth.clone().addScaledVector(out, 0.01);
    const b = mouth.clone().addScaledVector(out, 0.07);
    const c = b.clone().add(new THREE.Vector3(0.02, 0.01, 0.07));
    head.add(new THREE.Mesh(tube([[a.x, a.y, a.z], [b.x, b.y, b.z], [c.x, c.y, c.z]], 0.0065, 16), MAT.paint('#EAF3F6', 0.25)));
    head.add(part(rbox(0.012, 0.012, 0.11, 0.004), MAT.paint('#F4F0E6', 0.8), a.x, a.y - 0.004, a.z));
    anchors.mouth = headToUnit(c.x, c.y, angle, c.z);
  } else if (p.support === 'mask') {
    // simple face mask over the nose and mouth, with its oxygen tubing
    const mid = face.nose.clone().lerp(mouth, 0.5).addScaledVector(out, 0.035);
    const mask = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.052, 0.07, 22, 1, true), maskMat());
    mask.position.copy(mid);
    mask.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), out);
    head.add(mask);
    const port = mid.clone().addScaledVector(out, 0.04);
    const o2 = headToUnit(port.x, port.y, angle, port.z);
    g.add(new THREE.Mesh(tube([[o2.x, o2.y, o2.z], [o2.x + 0.15, o2.y - 0.12, -0.2], [0.5, 1.0, -0.5], [0.12, 1.36, -0.62]], 0.0045, 40), MAT.paint('#DDEFF2', 0.3)));
    anchors.mouth = headToUnit(mouth.x, mouth.y, angle, mouth.z);
  } else {
    anchors.mouth = headToUnit(mouth.x, mouth.y, angle, mouth.z);
  }
  if (p.table) {
    const n0 = face.nose;
    const tubeM = MAT.paint('#E6F2F3', 0.3);
    for (const s of [-1, 1]) {
      head.add(new THREE.Mesh(tube([[n0.x, n0.y - 0.005, n0.z], [n0.x - 0.05, n0.y - 0.04, s * 0.085], [n0.x - 0.16, n0.y - 0.09, s * 0.095], [-0.78, T + 0.05, s * 0.03]], 0.0035, 30), tubeM));
    }
  }
  const n = face.nose;
  anchors.nose = headToUnit(n.x, n.y, angle, n.z);
  anchors.hand ||= headToUnit(0.05, T + 0.2, angle, 0.15);
  return anchors;
}

/** A soft pillow: thick in the middle, thinning to its seams. */
let pillowGeo = null;
export function pillowGeometry() {
  if (pillowGeo) return pillowGeo;
  const g = new THREE.BoxGeometry(1, 1, 1, 12, 4, 16);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) * 2, y = p.getY(i), z = p.getZ(i) * 2;
    const edge = Math.max(Math.abs(x) ** 3, Math.abs(z) ** 3);
    p.setY(i, y * (1 - 0.72 * edge));
    p.setX(i, (x / 2) * (1 - 0.04 * Math.abs(z) ** 4));
    p.setZ(i, (z / 2) * (1 - 0.05 * Math.abs(x) ** 4));
  }
  g.scale(0.42, 0.15, 0.68);
  g.computeVertexNormals();
  g.userData.shared = true;
  pillowGeo = g;
  return g;
}

/**
 * The right arm out on its board for transradial access: draped to the
 * forearm, wrist prepped and extended, palm up, with the 6F radial sheath
 * sitting in the artery and its side-arm flushed.
 */
function radialArm(g, head, skin, anchors) {
  const drapeMat = blanketMat('cathlab');
  const shoulder = [-0.34, T + 0.08, 0.205];
  const elbow = [-0.04, T + 0.03, 0.6];
  const wrist = [0.24, T + 0.02, 0.7];
  head.add(limb(shoulder, elbow, 0.05, 0.046, drapeMat));          // arm drape over the upper arm
  head.add(limb(elbow, wrist, 0.037, 0.029, skin));
  const dir = new THREE.Vector3(...wrist).sub(new THREE.Vector3(...elbow)).normalize();
  const h = hand(new THREE.Vector3(...wrist), dir, new THREE.Vector3(0, -1, 0), skin, 1);   // palm up
  head.add(h.group);

  // padded arm board under the arm
  g.add(part(rbox(0.95, 0.03, 0.3, 0.01), MAT.charcoal(), BED.hingeX - 0.05, BED.deckY + T - 0.03, 0.68));
  g.add(part(rbox(0.93, 0.025, 0.28, 0.01), drapeMat, BED.hingeX - 0.05, BED.deckY + T - 0.005, 0.68));

  // 6F radial sheath: hub at the wrist, side-arm and three-way tap
  const w = new THREE.Vector3(...wrist).addScaledVector(dir, 0.02);
  const at = headToUnit(w.x, w.y + 0.03, 0, w.z - 0.012);
  g.add(part(cyl(0.0045, 0.0045, 0.07, 10), MAT.paint('#F2F2F2', 0.3), at.x - 0.03, at.y - 0.004, at.z, 0, 0, Math.PI / 2 - 0.15));
  g.add(part(rbox(0.03, 0.016, 0.016, 0.005), MAT.paint('#3A7BC8', 0.4), at.x + 0.012, at.y, at.z));
  g.add(new THREE.Mesh(tube([[at.x + 0.02, at.y, at.z], [at.x + 0.08, at.y + 0.02, at.z + 0.04], [at.x + 0.14, at.y - 0.01, at.z + 0.1]], 0.003, 20), MAT.glassClear()));
  g.add(part(rbox(0.025, 0.012, 0.025, 0.004), MAT.paint('#2F8F5B', 0.5), at.x + 0.15, at.y - 0.01, at.z + 0.11));
  anchors.hand = at;
  anchors.sheath = at;
}
