import * as THREE from 'three';
import { MAT, box, rbox, cyl, sphere, part } from './kit.js';

/* ============================================================
   LIFE AROUND THE HOSPITAL
   People walking in and out of the main entrance, staff in
   scrubs and white coats, a wheelchair being pushed, traffic on
   the road, and an ambulance that arrives with its lights going,
   backs into the bay, waits, and leaves again.

   Everything is cheap: shared geometry, a handful of materials,
   no physics. update(t, dt) runs only while the building is on
   screen.
   ============================================================ */

const v2 = (x, z) => new THREE.Vector2(x, z);

/* ---------- a person: legs and arms on hip/shoulder pivots ---------- */

// own geometry (not the shared cache): limbs are shifted so they swing from the hip and shoulder
const GEO = {
  leg: new THREE.BoxGeometry(0.15, 0.82, 0.17), torso: rbox(0.42, 0.62, 0.25, 0.06), arm: new THREE.BoxGeometry(0.11, 0.62, 0.12),
  head: sphere(0.12, 10, 8), hair: new THREE.SphereGeometry(0.125, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
};
GEO.leg.translate(0, -0.41, 0);
GEO.arm.translate(0, -0.3, 0);

function person({ top, legs, skin = '#C9A487', hair = '#3A2A20', scale = 1 }) {
  const g = new THREE.Group();
  const mk = (geo, color, x, y, z) => { const m = new THREE.Mesh(geo, MAT.paint(color, 0.85)); m.position.set(x, y, z); m.castShadow = true; return m; };
  const hipL = new THREE.Group(), hipR = new THREE.Group();
  hipL.position.set(-0.1, 0.86, 0); hipR.position.set(0.1, 0.86, 0);
  hipL.add(mk(GEO.leg, legs, 0, 0, 0)); hipR.add(mk(GEO.leg, legs, 0, 0, 0));
  const shL = new THREE.Group(), shR = new THREE.Group();
  shL.position.set(-0.27, 1.44, 0); shR.position.set(0.27, 1.44, 0);
  shL.add(mk(GEO.arm, top, 0, 0, 0)); shR.add(mk(GEO.arm, top, 0, 0, 0));
  g.add(hipL, hipR, shL, shR, mk(GEO.torso, top, 0, 1.17, 0), mk(GEO.head, skin, 0, 1.64, 0), mk(GEO.hair, hair, 0, 1.66, -0.01));
  g.scale.setScalar(scale);
  g.userData.limbs = { hipL, hipR, shL, shR };
  return g;
}

function stride(p, phase, amp = 0.55) {
  const s = Math.sin(phase) * amp;
  p.userData.limbs.hipL.rotation.x = s; p.userData.limbs.hipR.rotation.x = -s;
  p.userData.limbs.shL.rotation.x = -s * 0.8; p.userData.limbs.shR.rotation.x = s * 0.8;
}

function wheelchair() {
  const g = new THREE.Group();
  const dark = MAT.charcoal();
  g.add(part(box(0.5, 0.06, 0.5), MAT.paint('#2F4F7A', 0.6), 0, 0.5, 0));
  g.add(part(box(0.5, 0.5, 0.06), MAT.paint('#2F4F7A', 0.6), 0, 0.78, -0.25));
  for (const s of [-1, 1]) g.add(part(cyl(0.3, 0.3, 0.04, 18), dark, s * 0.3, 0.3, -0.05, 0, 0, Math.PI / 2));
  for (const s of [-1, 1]) g.add(part(cyl(0.08, 0.08, 0.04, 10), dark, s * 0.22, 0.08, 0.3, 0, 0, Math.PI / 2));
  // the seated patient
  const sit = person({ top: '#9FBCD1', legs: '#6B7C8C', skin: '#D1A98B', hair: '#BFBFBF' });
  stride(sit, 0, 0);
  sit.userData.limbs.hipL.rotation.x = sit.userData.limbs.hipR.rotation.x = -1.45;
  sit.position.set(0, -0.32, -0.08);
  g.add(sit);
  return g;
}

/* ---------- vehicles ---------- */

function carModel(color) {
  const c = new THREE.Group();
  c.add(part(rbox(4.4, 0.75, 1.8, 0.25), MAT.paint(color, 0.35), 0, 0.72, 0));
  c.add(part(rbox(2.4, 0.6, 1.62, 0.22), MAT.paint('#2A3640', 0.15), -0.2, 1.32, 0));
  for (const dx of [-1.4, 1.4]) for (const dz of [-0.82, 0.82]) c.add(part(cyl(0.34, 0.34, 0.24, 14), MAT.castor(), dx, 0.34, dz, Math.PI / 2, 0, 0));
  c.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return c;
}

function ambulanceModel() {
  const a = new THREE.Group();
  a.add(part(rbox(6.4, 2.5, 2.3, 0.2), MAT.paint('#F5F5F2', 0.4), -0.4, 1.75, 0));
  a.add(part(rbox(1.8, 1.5, 2.2, 0.3), MAT.paint('#F5F5F2', 0.4), 3.1, 1.25, 0));
  a.add(part(rbox(1.0, 0.8, 2.1, 0.15), MAT.paint('#2A3640', 0.15), 3.5, 1.55, 0));
  for (const s of [-1, 1]) {
    a.add(part(box(6.4, 0.3, 0.02), MAT.red(), -0.4, 1.5, s * 1.16));
    a.add(part(box(6.4, 0.18, 0.02), MAT.paint('#1F5FB4', 0.4), -0.4, 1.12, s * 1.16));
  }
  a.add(part(box(0.02, 0.9, 0.9), MAT.red(), -3.61, 2.0, 0));                     // red cross on the back doors
  a.add(part(box(0.03, 0.3, 0.9), MAT.paint('#FFFFFF', 0.4), -3.62, 2.0, 0));
  const blue = new THREE.MeshStandardMaterial({ color: '#1A2C66', emissive: '#3B6BFF', emissiveIntensity: 0 });
  const red = new THREE.MeshStandardMaterial({ color: '#661A1A', emissive: '#FF3030', emissiveIntensity: 0 });
  a.add(part(rbox(0.5, 0.18, 0.6, 0.06), blue, 2.0, 3.1, -0.45));
  a.add(part(rbox(0.5, 0.18, 0.6, 0.06), red, 2.0, 3.1, 0.45));
  a.add(part(rbox(0.3, 0.14, 0.4, 0.05), blue, -3.4, 3.08, -0.7));
  a.add(part(rbox(0.3, 0.14, 0.4, 0.05), red, -3.4, 3.08, 0.7));
  for (const dx of [-2.4, 2.6]) for (const dz of [-1.0, 1.0]) a.add(part(cyl(0.4, 0.4, 0.3, 14), MAT.castor(), dx, 0.4, dz, Math.PI / 2, 0, 0));
  a.traverse(o => { if (o.isMesh) o.castShadow = true; });
  // a light that washes the ground and the canopy blue while it runs
  const glow = new THREE.PointLight('#5C86FF', 0, 26, 2);
  glow.position.set(0.5, 3.6, 0);
  a.add(glow);
  return { group: a, blue, red, glow };
}

/** Face a model built along +x toward a direction in the ground plane. */
const headingTo = (dx, dz) => Math.atan2(-dz, dx);

/* ---------- walkers ---------- */

const ENTRANCE = v2(0, 17.5);
const ROUTES = [
  // in from the road crossing, the car park, the bus stop, the side paths — and back out
  [v2(-4, 63), v2(-3, 55), v2(-2, 40), v2(-1, 26), ENTRANCE],
  [v2(56, 26), v2(44, 28), v2(24, 26), v2(8, 22), ENTRANCE],
  [v2(-58, 50), v2(-40, 46), v2(-20, 34), v2(-6, 22), ENTRANCE],
  [v2(3, 64), v2(4, 52), v2(3, 34), v2(2, 22), ENTRANCE],
  [v2(60, 40), v2(40, 42), v2(16, 34), v2(5, 21), ENTRANCE],
  [v2(-64, 26), v2(-46, 24), v2(-24, 22), v2(-8, 20), ENTRANCE],
];
const LOOKS = [
  { top: '#2E5E8E', legs: '#2B2F36' }, { top: '#B5443A', legs: '#3A3F48' }, { top: '#E8E4DA', legs: '#4A5A6E' },
  { top: '#5F8F3E', legs: '#2B2F36' }, { top: '#7A4E8C', legs: '#2E3440' }, { top: '#D9A441', legs: '#4B4F58' },
  { top: '#3B7F8A', legs: '#3B7F8A', staff: true },   // scrubs
  { top: '#F4F4F2', legs: '#2E3440', staff: true },   // white coat
  { top: '#6E7F95', legs: '#1F2328' }, { top: '#C2C9CF', legs: '#5A4A3A' },
];

export function buildLife() {
  const root = new THREE.Group();
  const walkers = [];
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  for (let i = 0; i < 22; i++) {
    const look = LOOKS[i % LOOKS.length];
    const p = person({ ...look, skin: ['#C9A487', '#8D6448', '#E2BC9E', '#A97C5C'][i % 4], hair: ['#3A2A20', '#1C1C1C', '#7A5A3A', '#BFBFBF'][i % 4], scale: 0.92 + rnd() * 0.16 });
    root.add(p);
    const route = ROUTES[i % ROUTES.length];
    walkers.push({ obj: p, route, out: i % 2 === 1, u: rnd(), speed: 1.1 + rnd() * 0.45, phase: rnd() * 6, off: (rnd() - 0.5) * 2.2 });
  }
  // a porter pushing a wheelchair out to the drop-off
  const porter = person({ top: '#3B7F8A', legs: '#3B7F8A' });
  const chair = wheelchair();
  root.add(porter, chair);
  walkers.push({ obj: porter, chair, route: ROUTES[3], out: true, u: 0.2, speed: 0.85, phase: 0, off: 0.8 });

  // route lengths, for even speed along each polyline
  const lenOf = r => r.slice(1).reduce((s, p, k) => s + p.distanceTo(r[k]), 0);
  const at = (r, d) => {
    for (let k = 1; k < r.length; k++) {
      const seg = r[k].distanceTo(r[k - 1]);
      if (d <= seg || k === r.length - 1) { const f = Math.min(1, d / seg); return { p: r[k - 1].clone().lerp(r[k], f), dir: r[k].clone().sub(r[k - 1]).normalize() }; }
      d -= seg;
    }
  };
  walkers.forEach(w => { w.len = lenOf(w.route); });

  /* traffic on the main road: two lanes, opposite directions */
  const cars = [];
  ['#E8E8E6', '#2F3B4A', '#9E2B25', '#4C6C8C', '#1E1F22', '#B7BDC2'].forEach((c, i) => {
    const m = carModel(c);
    root.add(m);
    cars.push({ obj: m, lane: i % 2 ? 67.2 : 72.8, dir: i % 2 ? -1 : 1, x: -280 + i * 95, speed: 11 + (i % 3) * 2.5 });
  });

  /* the ambulance: arrive on blue lights, turn in, reverse into the bay, wait, leave */
  const amb = ambulanceModel();
  root.add(amb.group);
  const inbound = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-300, 0, 72.8), new THREE.Vector3(10, 0, 72.8), new THREE.Vector3(36, 0, 72.6),
    new THREE.Vector3(44, 0, 69), new THREE.Vector3(47, 0, 60), new THREE.Vector3(47, 0, 24), new THREE.Vector3(47, 0, 12),
  ]);
  const outbound = new THREE.CatmullRomCurve3([
    new THREE.Vector3(47, 0, -2), new THREE.Vector3(47, 0, 30), new THREE.Vector3(47.5, 0, 58), new THREE.Vector3(50.5, 0, 68),
    new THREE.Vector3(62, 0, 72.8), new THREE.Vector3(320, 0, 72.8),
  ]);
  // the timeline of one visit, in seconds
  const T = { drive: 22, turn: 6, reverse: 6, park: 14, leave: 22, gap: 10 };
  const cycle = T.drive + T.turn + T.reverse + T.park + T.leave + T.gap;
  const place = (pos, dx, dz) => { amb.group.position.set(pos.x, 0, pos.z); amb.group.rotation.y = headingTo(dx, dz); };
  const smooth = x => x * x * (3 - 2 * x);

  function updateAmbulance(t) {
    let s = (t + 4) % cycle;
    let lights = true;
    amb.group.visible = true;
    if (s < T.drive) {                                        // along the road and up the drive, nose first
      const u = smooth(s / T.drive) * 0.999;
      const p = inbound.getPointAt(u), d = inbound.getTangentAt(u);
      place(p, d.x, d.z);
    } else if ((s -= T.drive) < T.turn) {                     // swing round in the turning space to face the road
      const k = smooth(s / T.turn);
      const a0 = headingTo(0, -1), a1 = headingTo(0, 1);
      amb.group.position.set(47 + Math.sin(k * Math.PI) * 3.5, 0, 12 + Math.sin(k * Math.PI) * 1.5);
      amb.group.rotation.y = a0 + (a1 - a0) * k;
    } else if ((s -= T.turn) < T.reverse) {                   // back into the bay under the canopy
      const k = smooth(s / T.reverse);
      amb.group.position.set(47, 0, 12 - k * 14);
      amb.group.rotation.y = headingTo(0, 1);
    } else if ((s -= T.reverse) < T.park) {                   // crew unloads; lights off
      lights = false;
      amb.group.position.set(47, 0, -2);
      amb.group.rotation.y = headingTo(0, 1);
    } else if ((s -= T.park) < T.leave) {                     // drive away, no lights
      lights = false;
      const u = Math.min(0.999, (s / T.leave) ** 1.4);
      const p = outbound.getPointAt(u), d = outbound.getTangentAt(u);
      place(p, d.x, d.z);
    } else {
      amb.group.visible = false;
      lights = false;
    }
    const flash = lights ? (Math.floor(t * 6) % 2) : -1;
    amb.blue.emissiveIntensity = flash === 0 ? 3 : 0.1;
    amb.red.emissiveIntensity = flash === 1 ? 3 : 0.1;
    amb.glow.intensity = flash === -1 ? 0 : flash === 0 ? 60 : 0;
  }

  function update(t, dt) {
    for (const w of walkers) {
      w.u += (w.speed * dt) / w.len;
      if (w.u >= 1) { w.u -= 1; w.off = (Math.random() - 0.5) * 2.2; }
      const d = (w.out ? 1 - w.u : w.u) * w.len;
      const { p, dir } = at(w.route, d);
      const fwd = w.out ? dir.clone().negate() : dir;
      // walk a little to the side of the path's centre line, so crowds do not overlap
      const side = new THREE.Vector2(-fwd.y, fwd.x).multiplyScalar(w.off);
      w.obj.position.set(p.x + side.x, 0, p.y + side.y);
      w.obj.rotation.y = Math.atan2(fwd.x, fwd.y);
      w.phase += dt * w.speed * 5.2;
      stride(w.obj, w.phase, w.chair ? 0.35 : 0.55);
      if (w.chair) {
        w.obj.userData.limbs.shL.rotation.x = w.obj.userData.limbs.shR.rotation.x = -1.1;   // hands on the handles
        w.chair.position.set(w.obj.position.x + fwd.x * 0.95, 0, w.obj.position.z + fwd.y * 0.95);
        w.chair.rotation.y = w.obj.rotation.y;
      }
    }
    for (const c of cars) {
      c.x += c.dir * c.speed * dt;
      if (c.x > 320) c.x = -320; if (c.x < -320) c.x = 320;
      c.obj.position.set(c.x, 0, c.lane);
      c.obj.rotation.y = c.dir > 0 ? 0 : Math.PI;
    }
    updateAmbulance(t);
  }

  return {
    group: root,
    update,
    dispose() { amb.blue.dispose(); amb.red.dispose(); },
  };
}
