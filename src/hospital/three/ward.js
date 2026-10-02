import * as THREE from 'three';
import { MAT, box, rbox, cyl, sphere, plane, part, bake, screenMat } from './kit.js';
import * as TX from './textures.js';
import {
  BED, hospitalBed, headwall, wallMonitor, ivPole, ventilator, cannula,
  locker, overbedTable, armchair, plant, crashCart, apronRack,
} from './props.js';
import { KIND, pad2 } from '../data.js';

/* ============================================================
   THE WARD
   A 14 m × 26 m room, 3 m ceiling. Six bays down each long wall,
   heads to the wall, feet to the corridor; a curved nursing
   station in the middle (slatted wood front, grey top, LED
   under-glow — straight out of the reference ED); windows at
   the far end; doors and signage at the near end.

   World axes: x across the room, z along it (entrance at +z),
   y up. Left wall x = -7 holds beds 1–6, right wall x = +7 holds
   beds 7–12, both numbered from the entrance inward.
   ============================================================ */

export const ROOM = { W: 14, near: 14, far: -12, H: 3.0, bayPitch: 3.0, bayDepth: 2.9 };
const BAY_Z = [7.5, 4.5, 1.5, -1.5, -4.5, -7.5];

/* Fit-out per department type: what the room is dressed with. */
const FIT = {
  [KIND.critical]:  { curtain: '#3F8C89', floor: 'vinyl', floorTone: '#C9CCCB', bay: 'vinyl', bayTone: '#BCC9CC', head: 'tiles', pumps: 4, monitorBig: true,  table: false, chair: false, plants: 0, warmth: 0.0, light: '#F4F8FF' },
  [KIND.emergency]: { curtain: 'emergency', floor: 'vinyl', floorTone: '#C4C2BF', bay: 'wood', head: 'tiles', pumps: 1, monitorBig: false, table: false, chair: false, plants: 0, warmth: 0.2, light: '#FFF8EE', crash: true },
  [KIND.procedure]: { curtain: '#5C6F7E', floor: 'vinyl', floorTone: '#C3C6C8', bay: 'vinyl', bayTone: '#B6BEC4', head: 'tiles', pumps: 2, monitorBig: true,  table: false, chair: false, plants: 0, warmth: 0.0, light: '#F6F9FF', aprons: true, labDoor: true },
  [KIND.ward]:      { curtain: '#4A9FB2', floor: 'tiles', floorTone: '#DCD3C4', bay: null, head: 'tiles', pumps: 1, monitorBig: false, table: true,  chair: true,  plants: 2, warmth: 0.25, light: '#FFF7EC', chairColor: '#3E6F9E' },
  [KIND.comfort]:   { curtain: '#87A386', floor: 'vinyl', floorTone: '#D4CBBE', bay: 'wood', head: 'wood', pumps: 0, monitorBig: false, table: true,  chair: true,  plants: 6, warmth: 0.5, light: '#FFEBD2', chairColor: '#6E8F7A' },
};

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function buildWard(floor) {
  const fit = FIT[floor.kind] || FIT[KIND.ward];
  const root = new THREE.Group();
  const own = [];           // textures/materials created for this ward only
  const W = ROOM.W, H = ROOM.H, L = ROOM.near - ROOM.far, zMid = (ROOM.near + ROOM.far) / 2;

  /** A surface material with its own repeat (the texture source is shared). */
  const surf = (tex, rx, ry, opts = {}) => {
    const t = tex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, ...opts });
    own.push(t, m);
    return m;
  };
  const flat = (geom, mat, x, y, z, rx = -Math.PI / 2, ry = 0) => {
    const m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0);
    m.receiveShadow = true;
    root.add(m);
    return m;
  };

  /* ---------- floor ---------- */
  const floorMat = fit.floor === 'tiles'
    ? surf(TX.floorTiles(fit.floorTone), W / 1.2, L / 1.2, { roughness: 0.38 })
    : surf(TX.vinyl(fit.floorTone), W / 2.4, L / 2.4, { roughness: 0.55 });
  flat(new THREE.PlaneGeometry(W, L), floorMat, 0, 0, zMid);

  // bay zones under the beds: oak planks or a contrasting vinyl
  if (fit.bay) {
    const zoneMat = fit.bay === 'wood'
      ? surf(TX.wood(), ROOM.bayDepth / 1.1, 18.4 / 2.2, { roughness: 0.5 })
      : surf(TX.vinyl(fit.bayTone), 1.2, 7.5, { roughness: 0.55 });
    for (const s of [-1, 1]) {
      flat(new THREE.PlaneGeometry(ROOM.bayDepth, 18.4), zoneMat, s * (W / 2 - ROOM.bayDepth / 2), 0.004, 0);
    }
    if (fit.bay === 'wood') {
      // timber apron around the nursing station, as in the reference ED
      flat(new THREE.PlaneGeometry(4.3, 8.6), zoneMat, 0, 0.004, 0);
    }
  }

  // wayfinding line in the department colour, entrance to station
  const lineMat = new THREE.MeshStandardMaterial({ color: floor.hue, roughness: 0.5 });
  own.push(lineMat);
  flat(new THREE.PlaneGeometry(0.06, 8.6), lineMat, 0, 0.006, 9.4);

  /* ---------- walls ---------- */
  const plasterMat = surf(TX.plaster(floor.kind === KIND.comfort ? '#EFE6D7' : '#EEEAE2'), 6, 1, { roughness: 0.92 });
  const headMat = fit.head === 'wood'
    ? surf(TX.wood('#C29B6E'), 18, 1.6, { roughness: 0.55 })
    : surf(TX.wallTiles(), L / 1.2, 2.2 / 1.2, { roughness: 0.18 });

  for (const s of [-1, 1]) {
    const x = s * W / 2;
    flat(new THREE.PlaneGeometry(L, 2.2), headMat, x - s * 0.001, 1.1, zMid, 0, -s * Math.PI / 2);
    flat(new THREE.PlaneGeometry(L, H - 2.2), plasterMat, x, 2.2 + (H - 2.2) / 2, zMid, 0, -s * Math.PI / 2);
  }
  // end walls
  flat(new THREE.PlaneGeometry(W, H), plasterMat, 0, H / 2, ROOM.far, 0, 0);
  flat(new THREE.PlaneGeometry(W, H), plasterMat, 0, H / 2, ROOM.near, 0, Math.PI);

  // skirting all round, and a feature stripe in the department colour on the end walls
  const skirt = MAT.paint('#8A9097', 0.6);
  const stripe = new THREE.MeshStandardMaterial({ color: floor.hue, roughness: 0.6 });
  own.push(stripe);
  const trim = new THREE.Group();
  for (const s of [-1, 1]) trim.add(part(box(0.02, 0.1, L), skirt, s * (W / 2 - 0.01), 0.05, zMid));
  for (const z of [ROOM.far + 0.01, ROOM.near - 0.01]) {
    trim.add(part(box(W, 0.1, 0.02), skirt, 0, 0.05, z));
    trim.add(part(box(W, 0.12, 0.015), stripe, 0, 1.06, z));
    trim.add(part(rbox(W, 0.06, 0.05, 0.02), floor.kind === KIND.comfort ? MAT.oak() : MAT.lightGrey(), 0, 0.92, z + (z > 0 ? -0.025 : 0.025)));
  }
  root.add(bake(trim));

  /* ---------- ceiling ---------- */
  const ceilMat = surf(TX.ceilingTiles(), W / 0.6, L / 0.6, { roughness: 0.95 });
  flat(new THREE.PlaneGeometry(W, L), ceilMat, 0, H, zMid, Math.PI / 2);

  const fixtures = new THREE.Group();
  // recessed panels over every bay
  for (const s of [-1, 1]) for (const z of BAY_Z) {
    fixtures.add(part(box(1.2, 0.02, 0.6), MAT.lightPanel(), s * (W / 2 - 1.75), H - 0.012, z));
    fixtures.add(part(box(1.26, 0.015, 0.66), MAT.lightGrey(), s * (W / 2 - 1.75), H - 0.006, z));
  }
  // continuous linear LEDs down both sides of the corridor
  for (const s of [-1, 1]) {
    fixtures.add(part(box(0.08, 0.025, 24.4), MAT.ledCool(), s * 3.55, H - 0.014, 1.0));
  }
  // air-handling cassettes and smoke detectors
  for (const z of [7.4, 10.6, -6.2, -9.4]) {
    fixtures.add(part(box(0.62, 0.03, 0.62), MAT.lightGrey(), 0, H - 0.016, z));
    for (let k = 0; k < 4; k++) fixtures.add(part(box(0.5, 0.005, 0.03), MAT.grey(), 0, H - 0.033, z - 0.18 + k * 0.12));
  }
  for (const z of [5.2, -3.4]) fixtures.add(part(cyl(0.06, 0.06, 0.03, 14), MAT.plastic(), 1.8, H - 0.015, z));
  root.add(bake(fixtures, { castShadow: false }));

  /* ---------- far wall: windows onto daylight ---------- */
  const view = new THREE.MeshBasicMaterial({ map: TX.windowView(), toneMapped: false });
  const windows = new THREE.Group();
  const winXs = fit.labDoor ? [-4.4, 0] : [-4.4, 0, 4.4];
  for (const x of winXs) {
    windows.add(part(plane(3.0, 1.55), view, x, 1.72, ROOM.far + 0.012));
    windows.add(part(rbox(3.12, 0.07, 0.12, 0.02), MAT.lightGrey(), x, 0.92, ROOM.far + 0.05));          // sill
    windows.add(part(rbox(3.1, 0.05, 0.06, 0.015), MAT.lightGrey(), x, 2.5, ROOM.far + 0.03));          // head
    for (const dx of [-1.525, -0.5, 0.5, 1.525]) windows.add(part(box(0.05, 1.6, 0.05), MAT.lightGrey(), x + dx, 1.72, ROOM.far + 0.03));
    windows.add(part(box(3.0, 0.04, 0.04), MAT.lightGrey(), x, 2.08, ROOM.far + 0.03));                  // transom
    // drapes at each side, in the curtain fabric
    for (const s of [-1, 1]) {
      const d = new THREE.Mesh(pleat(0.5, 2.3, 0.045, 26), curtainMaterial(0.5));
      d.position.set(x + s * 1.75, 1.5, ROOM.far + 0.1);
      windows.add(d);
    }
  }
  root.add(bake(windows));

  // procedure units: the lab door replaces the third window
  if (fit.labDoor) {
    const lab = new THREE.Group();
    lab.add(part(rbox(1.9, 2.3, 0.08, 0.02), MAT.lightGrey(), 4.4, 1.15, ROOM.far + 0.04));
    lab.add(part(rbox(1.7, 2.18, 0.06, 0.02), MAT.paint('#D9DDE0', 0.45), 4.4, 1.12, ROOM.far + 0.08));
    lab.add(part(box(0.5, 0.35, 0.02), MAT.glassClear(), 4.4, 1.55, ROOM.far + 0.115));
    lab.add(part(box(0.04, 0.6, 0.04), MAT.chrome(), 3.85, 1.1, ROOM.far + 0.13));
    const warn = new THREE.MeshStandardMaterial({ color: '#600', emissive: '#FF3B2F', emissiveIntensity: 2.2 });
    own.push(warn);
    lab.add(part(rbox(0.7, 0.16, 0.06, 0.02), warn, 4.4, 2.48, ROOM.far + 0.05));
    root.add(bake(lab));
    sign(root, own, 'X-RAY IN USE', '#B3261E', 4.4, 2.48, ROOM.far + 0.085, 0, 0.66, 0.15);
    sign(root, own, (floor.name.includes('Electro') ? 'EP LAB' : floor.name.includes('Imaging') ? 'IMAGING SUITE' : 'CATH LAB') + ' 1', '#2B3138', 4.4, 2.72, ROOM.far + 0.03, 0, 1.0, 0.24);
  }

  /* ---------- near wall: doors and signage ---------- */
  const doors = new THREE.Group();
  for (const s of [-1, 1]) {
    doors.add(part(rbox(0.86, 2.15, 0.05, 0.02), MAT.paint('#DCD6CA', 0.5), s * 0.45, 1.08, ROOM.near - 0.03));
    doors.add(part(box(0.3, 0.6, 0.02), MAT.glassClear(), s * 0.45, 1.5, ROOM.near - 0.06));
    doors.add(part(rbox(0.03, 0.4, 0.04, 0.01), MAT.chrome(), s * 0.1, 1.05, ROOM.near - 0.08));
    doors.add(part(box(0.86, 0.3, 0.01), MAT.chrome(), s * 0.45, 0.2, ROOM.near - 0.06));
  }
  doors.add(part(rbox(1.96, 0.08, 0.1, 0.02), MAT.lightGrey(), 0, 2.2, ROOM.near - 0.05));
  root.add(bake(doors));
  sign(root, own, 'EXIT', '#1E7A3E', 0, 2.55, ROOM.near - 0.03, Math.PI, 0.5, 0.17);

  /* ---------- the nursing station ---------- */
  root.add(nursingStation(floor, fit, own));

  // hanging department sign over the station, readable from the entrance
  const signTex = TX.deptSign(floor.name, floor.hue, `Floor ${pad2(floor.number)}`);
  own.push(signTex);
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5, emissive: '#FFFFFF', emissiveMap: signTex, emissiveIntensity: 0.25 });
  own.push(signMat);
  const hang = new THREE.Group();
  hang.add(part(rbox(3.5, 0.68, 0.06, 0.02), MAT.charcoal(), 0, 2.48, 4.45));
  for (const dx of [-1.4, 1.4]) hang.add(part(cyl(0.008, 0.008, 0.34, 6), MAT.chrome(), dx, 2.83, 4.45));
  root.add(bake(hang));
  for (const [z, ry] of [[4.485, 0], [4.415, Math.PI]]) {
    const m = new THREE.Mesh(plane(3.42, 0.64), signMat);
    m.position.set(0, 2.48, z); m.rotation.y = ry;
    root.add(m);
  }
  // bay range signs at the head of each side
  sign(root, own, 'BEDS 01 – 06', '#2B3138', -4.4, 2.62, 9.6, 0, 1.0, 0.22);
  sign(root, own, 'BEDS 07 – 12', '#2B3138', 4.4, 2.62, 9.6, 0, 1.0, 0.22);

  /* ---------- the twelve bays ---------- */
  const live = [TX.liveMonitor(0), TX.liveMonitor(1), TX.liveMonitor(2)];
  own.push(...live.map(l => l.texture));
  const hitMat = new THREE.MeshBasicMaterial();
  own.push(hitMat);
  const beds = [];

  floor.beds.forEach((header, i) => {
    const side = i < 6 ? -1 : 1;
    const z = BAY_Z[i % 6];
    const number = i + 1;
    const seed = hash(floor.id + ':' + number);
    const occupied = !!header;

    const unit = new THREE.Group();
    unit.position.set(side * W / 2, 0, z);
    unit.rotation.y = side < 0 ? 0 : Math.PI;

    // airway support, decided per bed: intubated in critical care, then masks
    // and nasal cannulae scattered through the acute units
    const ventilated = occupied && floor.kind === KIND.critical && i % 2 === 0;
    const support = !occupied ? 'none'
      : ventilated ? 'vent'
      : floor.kind !== KIND.comfort && seed % 4 === 1 ? 'mask'
      : floor.kind !== KIND.comfort && seed % 3 === 0 ? 'cannula'
      : 'none';
    const bed = hospitalBed({ kind: floor.kind, occupied, patient: { seed, cap: seed % 5 === 0, support } });
    unit.add(bed.group);
    unit.add(headwall({ bedNumber: number, unitName: floor.name, header, hue: floor.hue, kind: floor.kind, own }));
    unit.add(wallMonitor(live[seed % 3].texture, fit.monitorBig));

    unit.add(ivPole({ pumps: occupied ? Math.max(1, fit.pumps) : 0, bag: occupied, lineTo: occupied ? bed.anchors.hand : null }));
    if (ventilated) unit.add(ventilator({ to: bed.anchors.mouth }));
    else if (support === 'cannula') unit.add(cannula(bed.anchors.nose));

    unit.add(locker({ kind: floor.kind }));
    if (fit.table) unit.add(overbedTable({}));
    if (fit.chair) unit.add(armchair({ color: fit.chairColor }));
    if (floor.kind === KIND.comfort) unit.add(plant({ x: 2.45, z: -1.18, h: 0.9 + (seed % 4) * 0.1 }));

    // hand-hygiene dispenser on the wall between bays
    unit.add(part(rbox(0.08, 0.24, 0.12, 0.02), MAT.plastic(), 0.04, 1.25, 1.12));
    unit.add(part(rbox(0.02, 0.04, 0.06, 0.01), MAT.paint('#3D7FC0', 0.5), 0.085, 1.18, 1.12));

    // interaction: an invisible hit volume over the bed, and a floor glow
    const hit = new THREE.Mesh(box(2.3, 1.3, 1.3), hitMat);
    hit.position.set(1.37, 0.65, 0);
    hit.visible = false;
    hit.userData = { keep: true, bed: i };
    unit.add(hit);

    const glowMat = new THREE.MeshBasicMaterial({ color: floor.hue, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    own.push(glowMat);
    const glow = new THREE.Mesh(roundedPlane(2.75, 2.5, 0.35), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(1.42, 0.012, 0);
    glow.userData.keep = true;
    unit.add(glow);

    const baked = bake(unit);
    root.add(baked);
    baked.updateMatrixWorld(true);

    const w = v => baked.localToWorld(new THREE.Vector3(...v));
    beds.push({
      index: i,
      number,
      header,
      occupied,
      side,
      hit,
      glow,
      label: w([BED.footX + 0.15, 1.3, 0]),
      // standing at the foot of the bed, just outside the bay, slightly to the IV side
      cam: { pos: w([3.3, 1.6, 0.48]), target: w([0.84, 1.12, -0.1]) },
    });
  });

  /* ---------- privacy curtains on ceiling tracks ---------- */
  root.add(curtainsAndTracks(fit, own));

  /* ---------- corridor equipment ---------- */
  const kit = new THREE.Group();
  kit.add(wow(-3.3, 10.4, 0.4));
  kit.add(wow(3.3, -5.9, -0.3));
  if (fit.crash) kit.add(crashCart({ x: 2.25, z: 5.1, ry: -Math.PI / 2 }));
  if (fit.aprons) kit.add(apronRack({ x: 2.2, z: ROOM.far + 0.03, ry: -Math.PI / 2 }));
  if (floor.kind === KIND.critical) kit.add(crashCart({ x: -2.3, z: -5.6, ry: Math.PI / 2 }));
  const potSpots = [[-5.9, 10.9], [5.9, 10.9], [-6.3, -11.2], [6.3, -11.2], [-2.6, 11.6], [2.6, 11.6]];
  for (let k = 0; k < fit.plants; k++) kit.add(plant({ x: potSpots[k][0], z: potSpots[k][1], h: 1.3 }));
  // waiting chairs by the entrance
  for (const x of [-5.6, -4.9, 4.9, 5.6]) kit.add(armchair({ x, z: 12.9, color: fit.chairColor || '#5C6F7E' }));
  root.add(bake(kit));

  /* ---------- light ---------- */
  const warm = new THREE.Color(fit.light);
  const hemi = new THREE.HemisphereLight(warm, new THREE.Color('#C8BBA8'), 0.55);
  root.add(hemi);

  const key = new THREE.DirectionalLight(warm, 1.55);
  key.position.set(3.5, 13, 5.5);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 40 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 4;
  root.add(key, key.target);

  const daylight = new THREE.DirectionalLight('#DDEBFF', 0.45);
  daylight.position.set(0, 4, -24);
  daylight.target.position.set(0, 0.5, 4);
  root.add(daylight, daylight.target);

  return {
    group: root,
    beds,
    shadowLight: key,
    entry: { pos: new THREE.Vector3(0, 2.25, 13.45), target: new THREE.Vector3(0, 0.82, -3.4) },
    update(t) { for (const l of live) l.draw(t); },
    dispose() {
      root.traverse(o => { if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose(); });
      own.forEach(x => x.dispose && x.dispose());
    },
  };

  /* ===== local builders (close over fit/own) ===== */

  function curtainMaterial(len) {
    const tex = TX.curtain(floor.kind === KIND.emergency ? 'emergency' : 'plain', fit.curtain === 'emergency' ? '#999' : fit.curtain);
    return surf(tex, Math.max(1, len), 1, { side: THREE.DoubleSide, alphaTest: 0.35, roughness: 0.92 });
  }

  function curtainsAndTracks() {
    const g = new THREE.Group();
    const railY = 2.45, dropTop = H;
    const halfLen = 1.35;
    const halfMat = curtainMaterial(halfLen);
    const bunchMat = curtainMaterial(1.6);
    const halfGeo = pleat(halfLen, 2.12, 0.04, 9);
    const bunchGeo = pleat(0.5, 2.12, 0.07, 34);
    // a couple of dividers on each side are half drawn, the rest gathered at
    // the wall — so the beds stay in view, as in the reference wards
    const halfDrawn = new Set([2, 5]);

    for (const s of [-1, 1]) {
      const wallX = s * W / 2;
      const frontX = s * (W / 2 - ROOM.bayDepth);
      for (let k = 0; k <= 6; k++) {
        const zDiv = 9 - k * 3;
        g.add(part(rbox(ROOM.bayDepth, 0.03, 0.04, 0.012), MAT.plastic(), (wallX + frontX) / 2, railY, zDiv));
        g.add(part(cyl(0.01, 0.01, dropTop - railY, 6), MAT.chrome(), frontX, (railY + dropTop) / 2, zDiv));
        if (halfDrawn.has(k) && s > 0 === (k === 5)) {
          const c = new THREE.Mesh(halfGeo, halfMat);
          c.position.set(wallX - s * (halfLen / 2 + 0.06), 1.36, zDiv);
          g.add(c);
        } else {
          const c = new THREE.Mesh(bunchGeo, bunchMat);
          c.position.set(wallX - s * 0.33, 1.36, zDiv);
          g.add(c);
        }
      }
      // front runs, curtain gathered at one corner of every bay
      for (const z of BAY_Z) {
        g.add(part(rbox(0.04, 0.03, ROOM.bayPitch, 0.012), MAT.plastic(), frontX, railY, z));
        const b = new THREE.Mesh(bunchGeo, bunchMat);
        b.position.set(frontX, 1.36, z - s * 1.18);
        b.rotation.y = Math.PI / 2;
        g.add(b);
      }
    }
    return bake(g);
  }

  function wow(x, z, ry) {
    const g = new THREE.Group();
    const inner = new THREE.Group();
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2;
      inner.add(part(rbox(0.24, 0.03, 0.04, 0.01), MAT.lightGrey(), Math.cos(a) * 0.12, 0.08, Math.sin(a) * 0.12, 0, -a, 0));
      inner.add(part(cyl(0.03, 0.03, 0.025, 10), MAT.castor(), Math.cos(a) * 0.24, 0.03, Math.sin(a) * 0.24, Math.PI / 2, -a, 0));
    }
    inner.add(part(cyl(0.035, 0.035, 0.85, 12), MAT.plastic(), 0, 0.5, 0));
    inner.add(part(rbox(0.5, 0.04, 0.4, 0.015), MAT.plastic(), 0, 0.95, 0));
    inner.add(part(rbox(0.36, 0.015, 0.25, 0.006), MAT.charcoal(), 0, 0.98, 0.02));
    const lid = part(rbox(0.36, 0.24, 0.012, 0.006), MAT.charcoal(), 0, 1.09, -0.105, -0.25, 0, 0);
    inner.add(lid);
    inner.add(part(plane(0.33, 0.21), screenMat(TX.workstationScreen(), 0.8), 0, 1.09, -0.098, -0.25, 0, 0));
    inner.position.set(x, 0, z);
    inner.rotation.y = ry;
    g.add(inner);
    return g;
  }
}

/* ---------- shared geometry builders ---------- */

/** A pleated curtain panel in the XY plane, folds displaced along Z. */
function pleat(len, h, amp, folds) {
  const g = new THREE.PlaneGeometry(len, h, Math.max(24, folds * 6), 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = (p.getX(i) + len / 2) / len;
    p.setZ(i, Math.sin(u * folds * Math.PI * 2) * amp * (0.85 + 0.15 * Math.sin(u * 7.1)));
  }
  g.computeVertexNormals();
  return g;
}

function roundedPlane(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return new THREE.ShapeGeometry(s, 8);
}

/** A flat sign panel with its text texture, both tracked for disposal. */
function sign(root, own, text, bg, x, y, z, ry, w, h) {
  const tex = TX.smallSign(text, bg, '#FFFFFF', 512, Math.round(512 * h / w));
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: '#FFFFFF', emissiveMap: tex, emissiveIntensity: bg === '#1E7A3E' ? 0.9 : 0.2 });
  own.push(tex, mat);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  root.add(m);
}

/**
 * The nursing station: a racetrack counter around a central spine, open at
 * the far end for staff. Vertical oak slats wrap the outside, a grey solid
 * surface tops it, an LED strip glows under the lip, and a lowered bulkhead
 * with downlights hangs above — the reference ED station, centred.
 */
function nursingStation(floor, fit, own) {
  const g = new THREE.Group();
  const R = 1.4, half = 2.0;           // radius of the ends, half-length of the straights
  const pts = [];
  const push = (x, z) => pts.push(new THREE.Vector2(x, z));
  for (let z = -half; z <= half + 1e-6; z += 0.25) push(R, z);
  for (let a = 0; a <= Math.PI + 1e-6; a += Math.PI / 14) push(R * Math.cos(a), half + R * Math.sin(a));
  for (let z = half; z >= -half - 1e-6; z -= 0.25) push(-R, z);
  const gapA = 0.5;
  const farArc = [];
  for (let a = Math.PI; a <= Math.PI * 2 + 1e-6; a += Math.PI / 14) {
    if (Math.abs(a - Math.PI * 1.5) < gapA) { farArc.push(null); continue; }
    farArc.push(new THREE.Vector2(R * Math.cos(a), -half + R * Math.sin(a)));
  }
  const runs = [pts.slice()];
  let cur = [];
  for (const p of farArc) { if (p) cur.push(p); else if (cur.length) { runs.push(cur); cur = []; } }
  if (cur.length) runs.push(cur);
  // join the far arc's start onto the main run so the counter is continuous
  runs[0] = runs[0].concat(runs.splice(1, 1)[0] || []);

  const slatMat = MAT.oak();
  const front = MAT.paint('#D8D2C6', 0.6);

  for (const run of runs) {
    for (let i = 0; i < run.length - 1; i++) {
      const a = run[i], b = run[i + 1];
      const dx = b.x - a.x, dz = b.y - a.y, len = Math.hypot(dx, dz);
      if (len < 1e-4) continue;
      const nx = dz / len, nz = -dx / len;             // outward normal
      const ry = Math.atan2(-dz, dx);
      const mx = (a.x + b.x) / 2, mz = (a.y + b.y) / 2;
      const at = (off, y, w, h, d, m) => part(box(len + 0.012, h, d), m, mx + nx * off, y, mz + nz * off, 0, ry, 0);
      g.add(at(0.16, 0.52, len, 1.02, 0.04, front));                    // front panel
      g.add(at(0.06, 1.09, len, 0.045, 0.46, MAT.counter()));            // top
      g.add(at(0.27, 1.065, len, 0.012, 0.02, MAT.ledWarm()));           // under-glow strip
      g.add(at(-0.42, 0.75, len, 0.035, 0.62, MAT.laminate()));          // inner desk
      g.add(at(0.17, 0.03, len, 0.06, 0.05, MAT.charcoal()));            // plinth
      // vertical slats
      const n = Math.max(1, Math.round(len / 0.072));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const sx = a.x + dx * t, sz = a.y + dz * t;
        g.add(part(box(0.034, 0.96, 0.028), slatMat, sx + nx * 0.2, 0.56, sz + nz * 0.2, 0, ry, 0));
      }
    }
  }

  // central spine with shelves, files and the unit's central display
  g.add(part(rbox(0.5, 1.5, 3.4, 0.03), MAT.laminate(), 0, 0.75, 0));
  const binders = ['#3A6EA5', '#C2362F', '#4C8A55', '#E1B23A', '#6B4E8C'];
  for (let k = 0; k < 18; k++) {
    for (const s of [-1, 1]) {
      g.add(part(box(0.24, 0.3, 0.06), MAT.paint(binders[(k + (s > 0 ? 2 : 0)) % 5], 0.6), s * 0.17, 1.18, -1.5 + k * 0.17));
    }
  }
  let central;
  if (floor.kind === KIND.critical || floor.kind === KIND.procedure) {
    // the central monitoring display: a still of the bedside traces
    const still = TX.liveMonitor(1).texture;
    central = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#FFF', emissiveMap: still, emissiveIntensity: 1.0, roughness: 0.3 });
    own.push(still, central);
  } else {
    central = screenMat(TX.workstationScreen(), 0.85);
  }
  for (const s of [-1, 1]) {
    g.add(part(rbox(0.06, 0.62, 1.05, 0.02), MAT.charcoal(), s * 0.28, 1.86, 0));
    g.add(part(plane(0.98, 0.56), central, s * 0.315, 1.86, 0, 0, s * Math.PI / 2, 0));
  }

  // four workstations and their chairs, screens facing the staff
  const ws = screenMat(TX.workstationScreen(), 0.8);
  for (const s of [-1, 1]) for (const z of [-1.0, 1.0]) {
    const x = s * (R - 0.3);
    g.add(part(rbox(0.05, 0.3, 0.48, 0.015), MAT.charcoal(), x, 1.0, z, 0, 0, 0));
    g.add(part(plane(0.44, 0.27), ws, x - s * 0.026, 1.0, z, 0, -s * Math.PI / 2, 0));
    g.add(part(rbox(0.12, 0.12, 0.08, 0.01), MAT.charcoal(), x, 0.82, z));
    g.add(part(rbox(0.16, 0.012, 0.42, 0.004), MAT.darkPlastic(), x - s * 0.22, 0.775, z));
    // task chair
    const cx = s * (R - 0.95);
    g.add(part(rbox(0.46, 0.08, 0.46, 0.03), MAT.charcoal(), cx, 0.5, z));
    g.add(part(rbox(0.07, 0.44, 0.42, 0.03), MAT.charcoal(), cx - s * 0.22, 0.8, z, 0, 0, s * 0.12));
    g.add(part(cyl(0.025, 0.025, 0.36, 8), MAT.chrome(), cx, 0.3, z));
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2;
      g.add(part(box(0.26, 0.025, 0.035), MAT.charcoal(), cx + Math.cos(a) * 0.13, 0.08, z + Math.sin(a) * 0.13, 0, -a, 0));
    }
  }
  // telephone + paperwork on the counter
  g.add(part(rbox(0.2, 0.06, 0.16, 0.02), MAT.charcoal(), R + 0.02, 1.15, 0.4));
  g.add(part(box(0.24, 0.015, 0.32), MAT.paint('#FBFBF8', 0.9), R + 0.04, 1.12, -0.55, 0, 0.2, 0));

  // lowered bulkhead with downlights
  const bulk = new THREE.Shape();
  const BR = R + 0.55, BH = half;
  bulk.absarc(0, BH, BR, 0, Math.PI, false);
  bulk.absarc(0, -BH, BR, Math.PI, Math.PI * 2, false);
  const bulkGeo = new THREE.ExtrudeGeometry(bulk, { depth: 0.24, bevelEnabled: false, curveSegments: 24 });
  bulkGeo.rotateX(Math.PI / 2);
  const bm = new THREE.Mesh(bulkGeo, MAT.paint('#E7E6E2', 0.9));
  bm.position.y = ROOM.H;
  g.add(bm);
  // downlights round both curved ends of the bulkhead, then down the straights
  for (let k = 1; k < 7; k++) {
    const a = (k / 7) * Math.PI;
    for (const [zc, s] of [[BH, 1], [-BH, -1]]) {
      g.add(part(cyl(0.045, 0.045, 0.02, 14), MAT.ledWarm(), (BR - 0.3) * Math.cos(a), ROOM.H - 0.25, zc + s * (BR - 0.3) * Math.sin(a)));
    }
  }
  for (const s of [-1, 1]) for (let z = -BH; z <= BH + 1e-6; z += 0.8) {
    g.add(part(cyl(0.045, 0.045, 0.02, 14), MAT.ledWarm(), s * (BR - 0.3), ROOM.H - 0.25, z));
  }

  return bake(g);
}
