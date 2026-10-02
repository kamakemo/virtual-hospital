import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* ============================================================
   GEOMETRY + MATERIAL KIT
   Small helpers that every prop is built from, a shared material
   library (one instance per look, so merging works), and `bake`,
   which collapses a prop's many meshes into one mesh per material.
   ============================================================ */

/* ---------- materials ---------- */

const M = new Map();
function mat(key, make) {
  if (!M.has(key)) M.set(key, make());
  return M.get(key);
}

const std = (color, rough = 0.6, metal = 0, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

export const MAT = {
  // bed + equipment plastics, matched to the reference beds (white with blue panels)
  plastic:    () => mat('plastic',    () => std('#F2F3F1', 0.42)),
  plasticWarm:() => mat('plasticW',   () => std('#ECE6DA', 0.45)),
  bedBlue:    () => mat('bedBlue',    () => std('#3C5FAE', 0.4)),
  bedTeal:    () => mat('bedTeal',    () => std('#3E8E9C', 0.45)),
  charcoal:   () => mat('charcoal',   () => std('#2D3338', 0.55)),
  darkPlastic:() => mat('darkPl',     () => std('#3A4046', 0.5)),
  grey:       () => mat('grey',       () => std('#9AA1A7', 0.5)),
  lightGrey:  () => mat('lightGrey',  () => std('#C9CDD1', 0.5)),
  chrome:     () => mat('chrome',     () => std('#D7DCE0', 0.22, 1)),
  steel:      () => mat('steel',      () => std('#AEB4BA', 0.35, 0.85)),
  castor:     () => mat('castor',     () => std('#2A2D31', 0.7)),

  // soft furnishings
  mattress:   () => mat('mattress',   () => std('#E7EEF4', 0.85)),
  linen:      () => mat('linen',      () => std('#F7F8F6', 0.95)),
  blanket:    () => mat('blanket',    () => std('#EEF1F2', 0.95)),
  blanketBlue:() => mat('blanketB',   () => std('#A9C3DA', 0.95)),
  blanketWarm:() => mat('blanketW',   () => std('#D9C9AE', 0.95)),
  pillow:     () => mat('pillow',     () => std('#FFFFFF', 0.9)),
  gown:       () => mat('gown',       () => std('#9FBCD1', 0.9)),

  // people
  skin: (tone) => mat('skin' + tone, () => std(tone, 0.62)),
  hair: (tone) => mat('hair' + tone, () => std(tone, 0.8)),
  cap:        () => mat('cap',        () => std('#7EB6E0', 0.85)),

  // furniture
  lockerBlue: () => mat('lockerB',    () => std('#4A6FB3', 0.45)),
  lockerTeal: () => mat('lockerT',    () => std('#3E8E9C', 0.45)),
  laminate:   () => mat('laminate',   () => std('#F4F1EA', 0.4)),
  oak:        () => mat('oak',        () => std('#B98F5E', 0.55)),
  upholstery: (c) => mat('uph' + c,   () => std(c, 0.85)),
  counter:    () => mat('counter',    () => std('#7F858B', 0.35, 0.05)),
  red:        () => mat('red',        () => std('#C2362F', 0.4)),
  yellow:     () => mat('yellow',     () => std('#E9C23F', 0.45)),
  green:      () => mat('green',      () => std('#4C8A55', 0.6)),
  leaf:       () => mat('leaf',       () => std('#3F7442', 0.75)),
  soil:       () => mat('soil',       () => std('#4A3A2C', 0.95)),

  // fluids + glass
  ivBag:      () => mat('ivbag',      () => new THREE.MeshPhysicalMaterial({ color: '#EAF4F8', roughness: 0.15, transmission: 0.6, thickness: 0.02, transparent: true, opacity: 0.85 })),
  glassClear: () => mat('glass',      () => new THREE.MeshPhysicalMaterial({ color: '#DDEBF0', roughness: 0.05, metalness: 0, transmission: 0.9, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })),

  // light sources
  lightPanel: () => mat('lpanel',     () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFF8EC', emissiveIntensity: 1.6, roughness: 1 })),
  ledWarm:    () => mat('ledWarm',    () => new THREE.MeshStandardMaterial({ color: '#FFF3DA', emissive: '#FFE4B0', emissiveIntensity: 2.2, roughness: 1 })),
  ledCool:    () => mat('ledCool',    () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#EAF4FF', emissiveIntensity: 2.4, roughness: 1 })),

  // generic coloured surface, cached by colour
  paint: (c, rough = 0.85) => mat('paint' + c + rough, () => std(c, rough)),
};

/** Material carrying a texture, cached by texture uuid. */
export function texMat(tex, opts = {}) {
  const key = 'tex' + tex.uuid + JSON.stringify(opts);
  return mat(key, () => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, ...opts }));
}

/** Self-lit screen — emissive so it glows like a real display. */
export function screenMat(tex, intensity = 1.15) {
  const key = 'scr' + tex.uuid + intensity;
  return mat(key, () => new THREE.MeshStandardMaterial({
    color: '#000000', emissive: '#FFFFFF', emissiveMap: tex, emissiveIntensity: intensity, roughness: 0.3,
  }));
}

/* ---------- geometry ---------- */

const G = new Map();
function geo(key, make) {
  if (!G.has(key)) {
    const g = make();
    g.userData.shared = true; // cached across wards — never dispose
    G.set(key, g);
  }
  return G.get(key);
}

export const box = (w, h, d) => geo(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d));
// Two segments per rounded edge: smooth at bedside distance, a quarter of the
// vertices of the RoundedBoxGeometry default once a ward holds hundreds of them.
export const rbox = (w, h, d, r = 0.02, seg = 2) =>
  geo(`rb${w},${h},${d},${r},${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)));
export const cyl = (rt, rb, h, seg = 16) => geo(`c${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));
export const sphere = (r, ws = 20, hs = 14) => geo(`s${r},${ws},${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
export const plane = (w, h) => geo(`p${w},${h}`, () => new THREE.PlaneGeometry(w, h));

/** Mesh at a position (and optional rotation), returned for chaining. */
export function part(geometry, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}

/** A tube along a list of points — rails, cables, curtain tracks. */
export function tube(points, radius = 0.012, seg = 40) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.05);
  return new THREE.TubeGeometry(curve, seg, radius, 8, false);
}

/**
 * Collapse every mesh under `root` into one mesh per material, with world
 * transforms baked in. Meshes marked `userData.keep` (screens, hit boxes,
 * anything animated) are left as live objects. Returns a new Group.
 */
export function bake(root, { castShadow = true, receiveShadow = true } = {}) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  const keep = [];

  root.traverse(o => {
    if (!o.isMesh) return;
    if (o.userData.keep) { keep.push(o); return; }
    const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const name of Object.keys(g.attributes)) {
      if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
    }
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    g.applyMatrix4(m);
    const key = o.material.uuid;
    if (!buckets.has(key)) buckets.set(key, { material: o.material, list: [] });
    buckets.get(key).list.push(g);
  });

  const out = new THREE.Group();
  out.position.copy(root.position);
  out.quaternion.copy(root.quaternion);
  out.scale.copy(root.scale);

  for (const { material, list } of buckets.values()) {
    const merged = mergeGeometries(list, false);
    list.forEach(g => g.dispose());
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = castShadow && !material.transparent;
    mesh.receiveShadow = receiveShadow;
    out.add(mesh);
  }

  for (const o of keep) {
    const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    o.removeFromParent();
    m.decompose(o.position, o.quaternion, o.scale);
    out.add(o);
  }
  return out;
}

/** Free GPU memory for everything under `root` (geometries + textures). */
export function disposeTree(root) {
  root.traverse(o => {
    if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose();
  });
}
