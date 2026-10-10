import * as THREE from 'three';
import { MAT, box, rbox, cyl, sphere, plane, part, bake } from './kit.js';
import * as TX from './textures.js';
import { HOSPITAL_NAME } from '../data.js';
import { buildLife } from './life.js';

/* ============================================================
   THE BUILDING
   A modern hospital on a landscaped site: a two-storey podium
   with a glazed main entrance under a canopy, and two 14-storey
   wings either side of a full-height glass atrium. Cream
   spandrels, ribbon glazing, sun louvres — after the reference
   "Hospital Complex" photograph.

   Each floor of each wing is its own hit target and its own
   glass material, so it can glow when hovered.
   ============================================================ */

export const STOREY = 3.7;
export const PODIUM_H = 9;

const TOWER = { w: 30, d: 22, gap: 8 }; // wings sit either side of a 16 m atrium

function tree(g, x, z, s = 1, seed = 1) {
  const greens = ['#4E7A3E', '#5C8A44', '#46703A', '#6A9150'];
  g.add(part(cyl(0.18 * s, 0.26 * s, 3.2 * s, 8), MAT.paint('#5B4634', 0.95), x, 1.6 * s, z));
  const n = 3 + (seed % 2);
  for (let i = 0; i < n; i++) {
    const a = seed * 1.7 + i * 2.1;
    const r = (1.6 + ((seed * 7 + i * 3) % 5) * 0.18) * s;
    const m = part(new THREE.IcosahedronGeometry(r, 1), MAT.paint(greens[(seed + i) % greens.length], 0.9),
      x + Math.cos(a) * 0.7 * s, (3.6 + i * 0.75) * s, z + Math.sin(a) * 0.7 * s);
    m.scale.y = 0.85;
    g.add(m);
  }
}

function car(g, x, z, ry, color) {
  const c = new THREE.Group();
  const body = MAT.paint(color, 0.35);
  c.add(part(rbox(4.4, 0.75, 1.8, 0.25), body, 0, 0.72, 0));
  c.add(part(rbox(2.4, 0.6, 1.62, 0.22), MAT.paint('#2A3640', 0.15), -0.2, 1.32, 0));
  for (const dx of [-1.4, 1.4]) for (const dz of [-0.82, 0.82]) {
    c.add(part(cyl(0.34, 0.34, 0.24, 14), MAT.castor(), dx, 0.34, dz, Math.PI / 2, 0, 0));
  }
  c.position.set(x, 0, z);
  c.rotation.y = ry;
  g.add(c);
}

export function buildExterior(wings) {
  const root = new THREE.Group();
  const own = [];
  const surf = (tex, rx, ry, opts = {}) => {
    const t = tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true;
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, ...opts });
    own.push(t, m);
    return m;
  };

  /* ---------- ground ---------- */
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), surf(TX.grass(), 90, 90, { roughness: 1 }));
  lawn.rotation.x = -Math.PI / 2; lawn.receiveShadow = true;
  root.add(lawn);

  const ground = new THREE.Group();
  const paveMat = surf(TX.paving(), 22, 8, { roughness: 0.85 });
  const asphMat = surf(TX.asphalt(), 60, 2, { roughness: 0.92 });
  const flatOn = (g, w, d, m, x, z, y = 0.02) => { const p = part(plane(w, d), m, x, y, z, -Math.PI / 2); p.receiveShadow = true; g.add(p); };
  flatOn(root, 120, 44, paveMat, 0, 33);                         // forecourt plaza
  flatOn(root, 600, 12, asphMat, 0, 70, 0.03);                    // main road
  flatOn(root, 22, 18, surf(TX.asphalt(), 4, 3, { roughness: 0.92 }), 0, 58, 0.035); // drive to the canopy
  flatOn(root, 60, 34, surf(TX.asphalt(), 10, 6, { roughness: 0.92 }), 82, 22, 0.03); // car park
  // lane and bay markings
  for (let x = -280; x < 280; x += 9) ground.add(part(box(4.5, 0.02, 0.18), MAT.paint('#F2F2EE', 0.6), x, 0.05, 70));
  for (let k = 0; k < 9; k++) ground.add(part(box(0.15, 0.02, 5.4), MAT.paint('#F2F2EE', 0.6), 58 + k * 5.5, 0.045, 12));
  for (let k = 0; k < 9; k++) ground.add(part(box(0.15, 0.02, 5.4), MAT.paint('#F2F2EE', 0.6), 58 + k * 5.5, 0.045, 32));
  // kerbs
  ground.add(part(box(600, 0.18, 0.3), MAT.lightGrey(), 0, 0.09, 63.9));
  ground.add(part(box(600, 0.18, 0.3), MAT.lightGrey(), 0, 0.09, 76.1));
  root.add(bake(ground, { castShadow: false }));

  /* ---------- podium ---------- */
  const shell = new THREE.Group();
  const cream = MAT.paint('#EDE6D6', 0.7);
  const creamDeep = MAT.paint('#E2D9C6', 0.75);
  const PW = 84, PD = 30;
  shell.add(part(box(PW, 1.6, PD), cream, 0, PODIUM_H - 0.8, 0));                   // first-floor slab band
  shell.add(part(box(PW, 1.2, PD), cream, 0, 4.0, 0));                              // mid band
  shell.add(part(box(PW + 0.6, 0.5, PD + 0.6), creamDeep, 0, PODIUM_H + 0.25, 0));  // podium roof coping
  // podium glazing, front and sides
  const podGlass = new THREE.MeshPhysicalMaterial({ map: TX.curtainWall(), roughness: 0.08, metalness: 0.2, envMapIntensity: 1.3 });
  // ground floor: you see into a warm, busy lobby
  const lobbyTex = TX.lobbyGlass().clone(); lobbyTex.wrapS = THREE.RepeatWrapping; lobbyTex.repeat.set(3, 1); lobbyTex.needsUpdate = true;
  const lobbyMat = new THREE.MeshPhysicalMaterial({ map: lobbyTex, emissive: '#FFE7C2', emissiveMap: lobbyTex, emissiveIntensity: 0.35, roughness: 0.1, metalness: 0.05, envMapIntensity: 0.9 });
  own.push(podGlass, lobbyTex, lobbyMat);
  shell.add(part(box(PW - 0.4, 3.3, PD - 0.4), lobbyMat, 0, 1.75, 0));
  shell.add(part(box(PW - 0.4, 3.2, PD - 0.4), podGlass, 0, 6.2, 0));
  // piers between glazing bays
  for (let x = -PW / 2; x <= PW / 2 + 0.01; x += 7) {
    shell.add(part(box(0.7, PODIUM_H, 0.7), cream, x, PODIUM_H / 2, PD / 2));
    shell.add(part(box(0.7, PODIUM_H, 0.7), cream, x, PODIUM_H / 2, -PD / 2));
  }

  // entrance canopy on columns, revolving door beneath
  shell.add(part(rbox(26, 0.55, 10, 0.12), MAT.plastic(), 0, 4.9, PD / 2 + 4.6));
  shell.add(part(box(26.2, 0.1, 10.2), MAT.lightGrey(), 0, 4.6, PD / 2 + 4.6));
  for (const x of [-11.5, 11.5]) shell.add(part(cyl(0.32, 0.32, 4.6, 16), MAT.plastic(), x, 2.3, PD / 2 + 8.9));
  shell.add(part(cyl(1.7, 1.7, 3.2, 28), MAT.glassClear(), 0, 1.6, PD / 2 + 0.4));
  shell.add(part(cyl(1.85, 1.85, 0.3, 28), MAT.charcoal(), 0, 3.35, PD / 2 + 0.4));
  // automatic sliding doors either side of the revolving door, in dark frames
  for (const x of [-4.6, 4.6]) {
    shell.add(part(box(3.4, 2.8, 0.12), MAT.glassClear(), x, 1.4, PD / 2 + 0.25));
    shell.add(part(box(3.6, 0.22, 0.2), MAT.charcoal(), x, 2.9, PD / 2 + 0.25));
    for (const dx of [-1.75, 0, 1.75]) shell.add(part(box(0.1, 2.8, 0.16), MAT.charcoal(), x + dx, 1.4, PD / 2 + 0.25));
  }
  // bollards along the drop-off kerb
  for (let x = -10; x <= 10; x += 2.5) shell.add(part(cyl(0.14, 0.14, 0.95, 10), MAT.charcoal(), x, 0.48, PD / 2 + 10.2));
  // planters along the façade
  for (const x of [-30, -20, 20, 30]) {
    shell.add(part(rbox(5, 0.8, 1.6, 0.1), MAT.paint('#CFC6B4', 0.8), x, 0.4, PD / 2 + 2));
    for (let k = 0; k < 4; k++) {
      const s = part(sphere(0.65, 12, 10), MAT.leaf(), x - 1.8 + k * 1.2, 1.1, PD / 2 + 2);
      s.scale.y = 0.75;
      shell.add(s);
    }
  }

  /* ---------- wings ---------- */
  const floorTargets = [];
  const panelMat = surf(TX.facadePanel(), 8, 1, { roughness: 0.72 });
  const fin = MAT.paint('#4F708C', 0.45);
  for (const wing of wings) {
    const cx = (wing.side === 'east' ? 1 : -1) * (TOWER.gap + TOWER.w / 2);
    const { w, d } = TOWER;

    for (const fl of wing.floors) {
      const y0 = PODIUM_H + 0.5 + (fl.number - 1) * STOREY;
      shell.add(part(box(w + 0.5, 1.15, d + 0.5), panelMat, cx, y0 + 0.575, 0));     // spandrel, panelled cladding
      shell.add(part(box(w + 1.2, 0.07, 0.9), MAT.lightGrey(), cx, y0 + 3.62, d / 2 + 0.45));   // louvre blades
      shell.add(part(box(w + 1.2, 0.07, 0.9), MAT.lightGrey(), cx, y0 + 3.35, d / 2 + 0.45));
      shell.add(part(box(0.9, 0.07, d + 1.2), MAT.lightGrey(), cx + (wing.side === 'east' ? 1 : -1) * (w / 2 + 0.45), y0 + 3.6, 0));

      // this floor's glass: its own material so it can light up on hover
      const glassTex = TX.ribbonGlass((fl.number * 3 + (wing.side === 'east' ? 1 : 2)) % 7);
      const glassMat = new THREE.MeshPhysicalMaterial({
        map: glassTex, roughness: 0.035, metalness: 0.55, envMapIntensity: 2.3, clearcoat: 0.6, clearcoatRoughness: 0.05,
        emissive: new THREE.Color(fl.hue), emissiveIntensity: 0,
      });
      own.push(glassMat);
      const glass = new THREE.Mesh(box(w, STOREY - 1.15, d), glassMat);
      glass.position.set(cx, y0 + 1.15 + (STOREY - 1.15) / 2, 0);
      glass.castShadow = true; glass.receiveShadow = true;
      root.add(glass);

      const hit = new THREE.Mesh(box(w + 1.4, STOREY, d + 1.6), new THREE.MeshBasicMaterial());
      hit.position.set(cx, y0 + STOREY / 2, 0);
      hit.visible = false;
      hit.userData = { wingId: wing.id, number: fl.number };
      root.add(hit);
      own.push(hit.material);

      floorTargets.push({
        wingId: wing.id,
        number: fl.number,
        name: fl.name,
        hue: fl.hue,
        hit,
        glassMat,
        centre: new THREE.Vector3(cx, y0 + STOREY / 2, d / 2),
      });
    }

    // roof: plant enclosure, parapet, wing name in blue lettering
    const roofY = PODIUM_H + 0.5 + wing.floors.length * STOREY;
    // vertical mullions over the glass, and deep coloured fins at the outer corners
    const hgt = roofY - (PODIUM_H + 0.5), ym = PODIUM_H + 0.5 + hgt / 2, sg = wing.side === 'east' ? 1 : -1;
    for (let x = -w / 2; x <= w / 2 + 0.01; x += 1.5) for (const zs of [1, -1]) shell.add(part(box(0.12, hgt, 0.2), MAT.lightGrey(), cx + x, ym, zs * (d / 2 + 0.06)));
    for (let z = -d / 2; z <= d / 2 + 0.01; z += 1.5) shell.add(part(box(0.2, hgt, 0.12), MAT.lightGrey(), cx + sg * (w / 2 + 0.06), ym, z));
    for (const zs of [1, -1]) shell.add(part(box(1.0, hgt + 2.6, 1.4), fin, cx + sg * (w / 2 + 0.3), ym + 1.3, zs * (d / 2 + 0.2)));
    shell.add(part(box(0.6, hgt + 2.6, 1.0), fin, cx - sg * (w / 2 - 0.1), ym + 1.3, d / 2 + 0.3));
    // roof edge guard rail, lift overrun, masts
    for (const zs of [1, -1]) shell.add(part(box(w + 0.6, 0.08, 0.08), MAT.steel(), cx, roofY + 2.5, zs * (d / 2 + 0.1)));
    for (const xs of [1, -1]) shell.add(part(box(0.08, 0.08, d + 0.6), MAT.steel(), cx + xs * (w / 2 + 0.1), roofY + 2.5, 0));
    shell.add(part(box(6, 3.6, 4.5), creamDeep, cx + sg * 9, roofY + 3.1, -6.5));
    shell.add(part(cyl(0.12, 0.12, 7, 8), MAT.steel(), cx - sg * 11, roofY + 4.9, -8));
    shell.add(part(box(w + 0.5, 1.4, d + 0.5), cream, cx, roofY + 0.7, 0));
    shell.add(part(box(w * 0.55, 3.2, d * 0.5), creamDeep, cx - Math.sign(cx) * 4, roofY + 2.0, -2));
    for (let k = 0; k < 6; k++) shell.add(part(box(w * 0.55 - 0.4, 0.06, 0.4), MAT.grey(), cx - Math.sign(cx) * 4, roofY + 0.8 + k * 0.5, d * 0.25 - 2.05));
    const letters = TX.lettering(wing.short.toUpperCase(), '#1D4FA8');
    const lm = new THREE.MeshStandardMaterial({ map: letters, transparent: true, roughness: 0.4, emissive: '#2B5FC7', emissiveMap: letters, emissiveIntensity: 0.35 });
    own.push(letters, lm);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.84, w * 0.84 / 8), lm);
    l.position.set(cx, roofY + 0.72, d / 2 + 0.27);
    root.add(l);

    // helipad on the cardiology roof, chillers on the medicine roof
    if (wing.side === 'east') {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 0.4, 48), [MAT.grey(), texMatOwned(TX.helipad(), own), MAT.grey()]);
      pad.position.set(cx + 4, roofY + 1.6, 1);
      pad.castShadow = true;
      root.add(pad);
      // perimeter lights round the pad, and a windsock
      const padLight = new THREE.MeshStandardMaterial({ color: '#CFFFD8', emissive: '#7CFF9E', emissiveIntensity: 1.8 });
      own.push(padLight);
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; shell.add(part(sphere(0.18, 8, 6), padLight, cx + 4 + Math.cos(a) * 7.2, roofY + 1.95, 1 + Math.sin(a) * 7.2)); }
      shell.add(part(cyl(0.07, 0.07, 4, 8), MAT.steel(), cx + 13, roofY + 3.4, -8));
      const sock = part(new THREE.ConeGeometry(0.45, 2.2, 14, 1, true), MAT.paint('#F06A1A', 0.6), cx + 14.1, roofY + 5.1, -8, 0, 0, Math.PI / 2 - 0.15);
      shell.add(sock);
    } else {
      for (let k = 0; k < 3; k++) shell.add(part(rbox(3.2, 2.2, 2.4, 0.15), MAT.lightGrey(), cx + 6 + k * 3.8, roofY + 2.5, 5));
    }
  }

  /* ---------- the atrium between the wings ---------- */
  const atriumH = PODIUM_H + 0.5 + 14 * STOREY + 3;
  const atriumGlass = new THREE.MeshPhysicalMaterial({ map: TX.curtainWall(), roughness: 0.05, metalness: 0.3, envMapIntensity: 1.5 });
  own.push(atriumGlass);
  const atrium = new THREE.Mesh(box(TOWER.gap * 2 - 0.6, atriumH, TOWER.d - 4), atriumGlass);
  atrium.position.set(0, atriumH / 2, -1);
  atrium.castShadow = true; atrium.receiveShadow = true;
  root.add(atrium);
  shell.add(part(box(TOWER.gap * 2 + 0.6, 1.2, TOWER.d - 2.6), cream, 0, atriumH + 0.6, -1));
  for (const s of [-1, 1]) shell.add(part(box(0.8, atriumH, 0.8), cream, s * (TOWER.gap - 0.4), atriumH / 2, TOWER.d / 2 - 3.4));

  root.add(bake(shell));

  // hospital name above the canopy, and on the atrium crown
  const nameTex = TX.lettering(HOSPITAL_NAME.toUpperCase(), '#1D4FA8');
  const nameMat = new THREE.MeshStandardMaterial({ map: nameTex, transparent: true, roughness: 0.4, emissive: '#2B5FC7', emissiveMap: nameTex, emissiveIntensity: 0.45 });
  own.push(nameTex, nameMat);
  // sits on the upper podium band, clear of the canopy below it
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(22.4, 2.8), nameMat);
  nm.position.set(0, 7.55, PD / 2 + 0.36);
  root.add(nm);

  /* ---------- planting, lighting columns, people-scale details ---------- */
  const land = new THREE.Group();
  let seed = 3;
  for (let x = -130; x <= 130; x += 13) {               // avenue along the road
    if (Math.abs(x) < 14) continue;
    tree(land, x, 62.4, 1.05, seed++);
    tree(land, x + 6, 78.5, 1.0, seed++);
  }
  for (const [x, z] of [[-55, 20], [-62, 4], [-58, -14], [-70, 30], [-50, 46], [55, 46], [-35, 50], [35, 50], [-80, -10], [-90, 18], [110, -6], [118, 24], [100, 46], [-46, -28], [48, -30], [0, -34]]) {
    tree(land, x, z, 1.2, seed++);
  }
  // hedges framing the plaza
  for (const s of [-1, 1]) {
    land.add(part(rbox(30, 1.0, 1.4, 0.4), MAT.leaf(), s * 32, 0.5, 52));
    land.add(part(rbox(1.4, 1.0, 24, 0.4), MAT.leaf(), s * 60, 0.5, 30));
  }
  // lamp columns along the drive
  for (const s of [-1, 1]) for (const z of [26, 38, 50]) {
    land.add(part(cyl(0.09, 0.12, 6, 10), MAT.charcoal(), s * 13, 3, z));
    land.add(part(rbox(1.0, 0.16, 0.34, 0.06), MAT.charcoal(), s * 12.6, 6.0, z));
  }
  // benches on the plaza
  for (const [x, z] of [[-22, 36], [22, 36], [-34, 26], [34, 26]]) {
    land.add(part(rbox(3, 0.12, 0.6, 0.05), MAT.oak(), x, 0.5, z));
    land.add(part(rbox(3, 0.6, 0.1, 0.05), MAT.oak(), x, 0.85, z - 0.32));
    for (const dx of [-1.3, 1.3]) land.add(part(box(0.08, 0.5, 0.5), MAT.charcoal(), x + dx, 0.25, z));
  }
  // site sign: the blue H
  land.add(part(rbox(3.4, 4.2, 0.6, 0.1), MAT.paint('#1D4FA8', 0.4), 18, 2.1, 60));
  for (const x of [17.25, 18.75]) land.add(part(box(0.5, 2.4, 0.05), MAT.plastic(), x, 2.4, 60.32));
  land.add(part(box(1.2, 0.45, 0.05), MAT.plastic(), 18, 2.4, 60.32));
  // cars in the car park, an ambulance at the side entrance
  const colors = ['#E8E8E6', '#2F3B4A', '#9E2B25', '#B7BDC2', '#1E1F22', '#4C6C8C', '#D8CFC0'];
  let ci = 0;
  for (let k = 0; k < 9; k++) {
    if (k % 3 !== 1) car(land, 58 + k * 5.5 + 0.1, 12 + 2.7, Math.PI / 2, colors[ci++ % colors.length]);
    if (k % 4 !== 2) car(land, 58 + k * 5.5 + 0.1, 32 - 2.7, -Math.PI / 2, colors[ci++ % colors.length]);
  }
  land.add(part(rbox(10, 0.3, 6, 0.1), MAT.plastic(), 47, 4.4, -2));
  land.add(part(box(10.2, 0.95, 0.25), MAT.plastic(), 47, 4.9, 1.05));            // canopy fascia
  for (const x of [42.6, 51.4]) land.add(part(cyl(0.2, 0.2, 4.4, 12), MAT.plastic(), x, 2.2, 0.8));
  // ambulance-only drive from the road
  flatOn(root, 9, 62, surf(TX.asphalt(), 2, 10, { roughness: 0.92 }), 47, 33, 0.04);
  for (let z = 6; z < 62; z += 6) land.add(part(box(0.18, 0.02, 3), MAT.paint('#F2C94C', 0.6), 47, 0.06, z));
  // zebra crossing over the drop-off drive
  for (let x = -9; x <= 9; x += 1.5) land.add(part(box(0.75, 0.02, 3.2), MAT.paint('#F4F4F0', 0.6), x, 0.06, 55));
  root.add(bake(land));

  // EMERGENCY: red, backlit, on the ambulance canopy — and a red cross sign by the drive
  const erTex = TX.lettering('EMERGENCY', '#D62828', 1536, 256);
  const erMat = new THREE.MeshStandardMaterial({ map: erTex, transparent: true, emissive: '#FF2A2A', emissiveMap: erTex, emissiveIntensity: 1.1, roughness: 0.4 });
  own.push(erTex, erMat);
  const er = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 1.4), erMat);
  er.position.set(47, 4.9, 1.2);
  root.add(er);
  const signs = new THREE.Group();
  const lightBox = (text, bg, x, z, ry = 0) => {
    const t = TX.smallSign(text, bg, '#FFFFFF', 512, 160);
    const m = new THREE.MeshStandardMaterial({ map: t, emissive: '#FFFFFF', emissiveMap: t, emissiveIntensity: 0.5, roughness: 0.5 });
    own.push(t, m);
    const g = new THREE.Group();
    g.add(part(rbox(3.4, 1.25, 0.3, 0.06), MAT.charcoal(), 0, 2.6, 0));
    g.add(part(plane(3.2, 1.0), m, 0, 2.6, 0.16));
    g.add(part(cyl(0.08, 0.08, 2.0, 8), MAT.charcoal(), -1.2, 1.0, 0));
    g.add(part(cyl(0.08, 0.08, 2.0, 8), MAT.charcoal(), 1.2, 1.0, 0));
    g.position.set(x, 0, z); g.rotation.y = ry;
    signs.add(g);
  };
  lightBox('MAIN ENTRANCE', '#1D4FA8', -16, 60);
  lightBox('EMERGENCY  →', '#C62828', 30, 60);
  lightBox('PARKING  →', '#1F6E5A', 54, 60);
  lightBox('EMERGENCY', '#C62828', 52.6, 3.2, -0.3);
  root.add(signs);

  /* ---------- the city beyond the grounds, fading into haze ---------- */
  const city = new THREE.Group();
  const cityMats = [0, 1, 2, 3, 4].map(k => surf(TX.cityBlock(k), 2, 3, { roughness: 0.85 }));
  let cs = 11;
  const rnd = () => ((cs = (cs * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = 360 + rnd() * 280;
    const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
    if (z > 60 && Math.abs(x) < 120) continue;                        // keep the front view open over the road
    const h = 14 + rnd() * rnd() * 80, wdt = 18 + rnd() * 26, dep = 16 + rnd() * 20;
    city.add(part(box(wdt, h, dep), cityMats[i % 5], x, h / 2, z, 0, rnd() * Math.PI, 0));
  }
  root.add(bake(city, { castShadow: false, receiveShadow: false }));

  /* ---------- people and traffic ---------- */
  const life = buildLife();
  root.add(life.group);

  /* ---------- sky + sun ---------- */
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color('#5C9BD8') }, horizon: { value: new THREE.Color('#F0DFC2') }, ground: { value: new THREE.Color('#B9B49E') },
      sunDir: { value: new THREE.Vector3(150, 105, 140).normalize() }, sunCol: { value: new THREE.Color('#FFD39A') },
    },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    // a late-afternoon sky: warm haze at the horizon, a sun with its glow, and soft drifting cumulus
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 ground; uniform vec3 sunDir; uniform vec3 sunCol; varying vec3 vP;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
      void main(){
        float h = vP.y;
        vec3 c = h > 0.0 ? mix(horizon, top, pow(h, 0.5)) : mix(horizon, ground, pow(-h, 0.4));
        float s = max(dot(vP, sunDir), 0.0);
        c += sunCol * (pow(s, 6.0) * 0.32 + pow(s, 900.0) * 6.0);
        if (h > 0.0) {
          vec2 uv = vP.xz / (h + 0.15) * 1.4;
          float cl = smoothstep(0.56, 0.86, fbm(uv + vec2(3.0, 1.0)));
          vec3 cloud = mix(vec3(1.0, 0.97, 0.93), vec3(0.86, 0.86, 0.9), smoothstep(0.65, 0.95, fbm(uv * 2.0))) + sunCol * pow(s, 3.0) * 0.3;
          c = mix(c, cloud, cl * 0.7 * smoothstep(0.0, 0.2, h));
        }
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  own.push(sky.material, sky.geometry);

  // low, warm afternoon sun: long shadows across the plaza, light raking the façade
  const hemi = new THREE.HemisphereLight('#CFE0F2', '#7E8B66', 0.78);
  const sun = new THREE.DirectionalLight('#FFD9A8', 3.1);
  sun.position.set(150, 105, 140);
  sun.target.position.set(0, 20, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 10, far: 520 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.05;
  root.add(hemi, sun, sun.target);

  return {
    group: root,
    sky,
    floors: floorTargets,
    shadowLight: sun,
    // a three-quarter view from the forecourt, the whole building in frame
    home: { pos: new THREE.Vector3(58, 22, 150), target: new THREE.Vector3(0, 30, 0) },
    update: life.update,
    dispose() {
      life.dispose();
      root.traverse(o => { if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose(); });
      own.forEach(x => x.dispose && x.dispose());
    },
  };
}

function texMatOwned(tex, own) {
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
  own.push(m);
  return m;
}
