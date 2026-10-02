import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ============================================================
   PATIENT ASSETS
   A 3D-scanned human head (Lee Perry-Smith, Infinite-Realities,
   CC BY 3.0 — see public/models/patient/CREDITS.md), loaded once
   and shared by every patient in every ward.

   The scan is a bust; it is trimmed at the base of the neck so the
   gowned shoulders can be built to fit. A hair shell and a theatre
   cap are grown from the scalp itself — the same surface pushed out
   along its normals — so they follow the skull exactly.
   ============================================================ */

const BASE = '/models/patient/';

/* Model-space landmarks on the scan (y up, face toward +z). */
export const LANDMARK = {
  crownY: 3.97,
  neckCutY: -1.4,       // where the neck is still round, above the shoulder flare
  backZ: -2.05,
  nose: new THREE.Vector3(-0.09, 1.1, 2.59),
  mouth: new THREE.Vector3(0, -0.2, 2.18),
  chin: new THREE.Vector3(0, -0.95, 1.55),
};

let assets = null;
let pending = null;

export function getPatientAssets() { return assets; }

export function loadPatientAssets(renderer) {
  if (pending) return pending;
  const tl = new THREE.TextureLoader();
  const tex = (name, srgb) => new Promise((res, rej) => tl.load(BASE + name, t => {
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    res(t);
  }, undefined, rej));
  const glb = new Promise((res, rej) => new GLTFLoader().load(BASE + 'head.glb', res, undefined, rej));

  pending = Promise.all([glb, tex('head-color.jpg', true), tex('head-normal.jpg', false)])
    .then(([gltf, color, normal]) => {
      let src = null;
      gltf.scene.traverse(o => { if (o.isMesh && !src) src = o; });
      const head = trimBelow(src.geometry, LANDMARK.neckCutY);
      head.computeBoundingSphere();
      const hair = shell(head, 0.075, isHair);
      const cap = shell(head, 0.14, isCap);
      // shared by every ward for the life of the app — never disposed with a ward
      for (const g of [head, hair, cap]) g.userData.shared = true;
      assets = {
        head,
        hair,
        cap,
        color, normal,
        skin: averageSkin(color.image),
      };
      return assets;
    })
    .catch(err => { console.warn('[patient] head scan unavailable, using the modelled head', err); return null; });
  return pending;
}

/** Keep only triangles whose centroid lies above y = cut (drops the shoulders). */
function trimBelow(geo, cut) {
  const g = geo.clone();
  const pos = g.attributes.position;
  const idx = g.index.array;
  const keep = [];
  for (let i = 0; i < idx.length; i += 3) {
    const y = (pos.getY(idx[i]) + pos.getY(idx[i + 1]) + pos.getY(idx[i + 2])) / 3;
    if (y > cut) keep.push(idx[i], idx[i + 1], idx[i + 2]);
  }
  g.setIndex(keep);
  return g;
}

/* Scalp regions. Hair stops above the brow at the front, above the ears at
   the sides, and runs down to the nape at the back; a cap sits higher. */
function isHair(x, y, z) {
  if (z > 0.7) return y > 2.3;
  if (z > -0.3) return y > 1.6 || (Math.abs(x) < 1.3 && y > 1.2);
  return y > -0.55;
}
function isCap(x, y, z) {
  if (z > 0.7) return y > 2.45;
  return y > 1.05;
}

/** A surface grown outward from the parts of `geo` inside `region`. */
function shell(geo, offset, region) {
  const g = geo.clone();
  const pos = g.attributes.position, nor = g.attributes.normal;
  const idx = g.index.array;
  const keep = [];
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    const x = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3;
    const y = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
    const z = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3;
    if (region(x, y, z)) keep.push(a, b, c);
  }
  // feather the edge: vertices on the boundary get less offset, so the
  // shell meets the scalp instead of ending in a visible step
  const inside = new Uint8Array(pos.count);
  for (const v of keep) inside[v]++;
  const out = new Float32Array(pos.count * 3);
  for (let v = 0; v < pos.count; v++) {
    const f = inside[v] >= 4 ? 1 : inside[v] > 0 ? 0.45 : 0;
    out[v * 3] = pos.getX(v) + nor.getX(v) * offset * f;
    out[v * 3 + 1] = pos.getY(v) + nor.getY(v) * offset * f;
    out[v * 3 + 2] = pos.getZ(v) + nor.getZ(v) * offset * f;
  }
  g.setAttribute('position', new THREE.BufferAttribute(out, 3));
  g.setIndex(keep);
  g.computeVertexNormals();
  return g;
}

/** Mean colour of the scan's skin, so arms and hands match the face. */
function averageSkin(img) {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, 64, 64);
    const d = g.getImageData(0, 0, 64, 64).data;
    let r = 0, gg = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const l = d[i] + d[i + 1] + d[i + 2];
      if (l < 150 || l > 700) continue;           // skip seams, shadows and highlights
      r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++;
    }
    return new THREE.Color(`rgb(${Math.round(r / n)},${Math.round(gg / n)},${Math.round(b / n)})`);
  } catch {
    return new THREE.Color('#C99B82');
  }
}
