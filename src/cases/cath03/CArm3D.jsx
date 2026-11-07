import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TREE } from './anatomy.js';
import { VESSELS, basis } from './projection.js';

/* ============================================================
   CATH LAB · CASE 03 — THE C-ARM IN 3D
   The patient lies supine, head toward the gantry. The C-arm
   turns about the patient's long axis (RAO ↔ LAO) and tilts
   toward head or feet (cranial ↔ caudal). The flat-panel
   DETECTOR is always the named side; the X-ray TUBE sits
   opposite, under the table. The beam is drawn so you can see
   which way the heart is being looked through.

   Patient frame (x left, y cranial, z anterior, cm) maps to the
   world as: cranial → −X, anterior → +Y (up), left → −Z.
   ============================================================ */

const W = p => new THREE.Vector3(-p[1], p[2], -p[0]);
const ISO = W(TREE.iso);
const TABLE_TOP = -11.8;          // world Y of the table top (just under the back)
const FLOOR = TABLE_TOP - 92;

function label(text, { color = '#E9F2FC', bg = 'rgba(5,11,22,0.78)', size = 64, w = 512, h = 128 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill();
  g.fillStyle = color; g.font = `800 ${size}px Archivo, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.renderOrder = 10;
  s.scale.set(w / h * 7, 7, 1);
  return s;
}

function floorText(text, color) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = color; g.font = '800 70px Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 66);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(48, 12), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

function tubeBetween(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 16), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}

export default function CArm3D({ lao, cra, system, screen, onScreenClick, height = 460, injecting = false }) {
  const host = useRef(null);
  const S = useRef({});
  S.current.lao = lao; S.current.cra = cra; S.current.system = system; S.current.onScreenClick = onScreenClick;
  S.current.injecting = injecting;

  useEffect(() => {
    const el = host.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';   // vertical swipes scroll the page, horizontal ones turn the room

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A1422');
    scene.fog = new THREE.Fog('#0A1422', 420, 900);
    const camera = new THREE.PerspectiveCamera(42, 1, 1, 3000);

    scene.add(new THREE.HemisphereLight('#CFE3FF', '#1B2433', 1.1));
    const key = new THREE.DirectionalLight('#FFFFFF', 1.6); key.position.set(120, 260, 160); scene.add(key);
    const rim = new THREE.DirectionalLight('#7DD3FC', 0.6); rim.position.set(-200, 120, -220); scene.add(rim);

    const own = [];
    const mat = (o) => { const m = new THREE.MeshStandardMaterial(o); own.push(m); return m; };

    // floor and grid
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), mat({ color: '#111C2B', roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR; scene.add(floor);
    const grid = new THREE.GridHelper(900, 36, '#22D3EE', '#1C2A3D');
    grid.position.y = FLOOR + 0.2; grid.material.transparent = true; grid.material.opacity = 0.25; scene.add(grid);

    // table: top, pedestal, base
    const tableMat = mat({ color: '#C8CED6', roughness: 0.5, metalness: 0.2 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(215, 3.5, 52), mat({ color: '#2B3442', roughness: 0.6 }));
    top.position.set(40, TABLE_TOP - 1.8, 0); scene.add(top);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(200, 3, 46), mat({ color: '#D9773B', roughness: 0.8 }));
    pad.position.set(45, TABLE_TOP + 0.2, 0); scene.add(pad);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(40, 82, 30), tableMat); ped.position.set(105, (TABLE_TOP + FLOOR) / 2, 0); scene.add(ped);
    const base = new THREE.Mesh(new THREE.BoxGeometry(90, 6, 48), tableMat); base.position.set(105, FLOOR + 3, 0); scene.add(base);

    // the patient: a translucent body so the heart shows through
    const skin = mat({ color: '#F2C7A5', roughness: 0.7, transparent: true, opacity: 0.24, depthWrite: false });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1, 8, 24), skin);
    torso.scale.set(9.5, 23, 17.5);    // capsule along local Y, laid along X by the rotation
    torso.rotation.z = Math.PI / 2;
    torso.position.copy(W([0, -10, -2.6]));
    scene.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 16), skin); head.position.copy(W([0, 33, -3.2])); scene.add(head);
    const legs = new THREE.Mesh(new THREE.CapsuleGeometry(7, 70, 8, 16), skin); legs.rotation.z = Math.PI / 2;
    legs.position.copy(W([0, -82, -4.5])); legs.scale.set(1, 1, 2.1); scene.add(legs);
    const outline = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1, 8, 24), new THREE.MeshBasicMaterial({ color: '#F2C7A5', wireframe: true, transparent: true, opacity: 0.1 }));
    outline.scale.copy(torso.scale); outline.rotation.copy(torso.rotation); outline.position.copy(torso.position); scene.add(outline);

    // spine
    const bone = mat({ color: '#E7E0D2', roughness: 0.6 });
    for (let y = -26; y <= 22; y += 3.2) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 2.4, 14), bone);
      v.position.copy(W([TREE.spine.x, y, TREE.spine.z])); v.rotation.z = Math.PI / 2; scene.add(v);
    }

    // heart, aorta and coronaries — a teaching model, drawn 1.8× life size about the
    // isocentre so the tree can be read from across the room
    const anat = new THREE.Group(); anat.position.copy(ISO); anat.scale.setScalar(1.8); scene.add(anat);
    const L = p => W(p).sub(ISO);
    const { centre, apex, radii } = TREE.heart;
    const heart = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mat({ color: '#E11D48', roughness: 0.45, transparent: true, opacity: 0.3, depthWrite: false, emissive: '#5B0A1E', emissiveIntensity: 0.6 }));
    heart.position.copy(L(centre));
    heart.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), W(apex).sub(W(centre)).normalize());
    heart.scale.set(radii[0], radii[1], radii[2]);
    heart.renderOrder = 2;
    anat.add(heart);
    const aorta = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(TREE.aorta.map(L)), 64, 1.25, 16), mat({ color: '#FCA5A5', transparent: true, opacity: 0.35, roughness: 0.4, depthWrite: false }));
    anat.add(aorta);

    const vesselMeshes = [];
    for (const v of VESSELS) {
      const m = mat({ color: v.color, emissive: v.color, emissiveIntensity: 0.55, roughness: 0.35 });
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v.s.map(L)), 90, Math.max(0.2, v.r0 * 0.5), 10), m);
      tube.userData.system = v.system;
      vesselMeshes.push(tube);
      anat.add(tube);
    }

    // the C-arm
    const carm = new THREE.Group();
    const cMat = mat({ color: '#E6EBF1', roughness: 0.35, metalness: 0.25 });
    const RC = 82;
    const arc = new THREE.Mesh(new THREE.TorusGeometry(RC, 5.2, 16, 64, Math.PI), cMat);
    arc.rotation.z = Math.PI / 2;            // from +Y through −X to −Y
    carm.add(arc);
    // flat-panel detector (beam side +Y)
    const det = new THREE.Group();
    const detBox = new THREE.Mesh(new THREE.BoxGeometry(44, 9, 44), mat({ color: '#2DD4BF', roughness: 0.35, metalness: 0.2, emissive: '#0E5E57', emissiveIntensity: 0.5 }));
    det.add(detBox);
    const detFace = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: '#0B1B26' }));
    detFace.rotation.x = Math.PI / 2; detFace.position.y = -4.6; det.add(detFace);
    det.position.y = 46; carm.add(det);
    carm.add(tubeBetween(new THREE.Vector3(0, 50, 0), new THREE.Vector3(0, RC, 0), 3.4, cMat));
    const detLabel = label('DETECTOR', { color: '#2DD4BF' }); detLabel.position.set(0, 60, 0); carm.add(detLabel);
    // X-ray tube (source, −Y)
    const tubeHousing = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 22, 24), mat({ color: '#9CA3AF', roughness: 0.4, metalness: 0.4 }));
    tubeHousing.rotation.z = Math.PI / 2; tubeHousing.position.y = -64; carm.add(tubeHousing);
    const coll = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 14), mat({ color: '#475569', roughness: 0.5 }));
    coll.position.y = -55; carm.add(coll);
    carm.add(tubeBetween(new THREE.Vector3(0, -68, 0), new THREE.Vector3(0, -RC, 0), 3.4, cMat));
    const srcLabel = label('X-RAY TUBE', { color: '#FBBF24' }); srcLabel.position.set(0, -78, 0); carm.add(srcLabel);
    // the beam: a cone from the focal spot to the detector face
    const beamLen = 46 - 4.6 + 51;
    const beamGeo = new THREE.ConeGeometry(21, beamLen, 4, 1, true);
    beamGeo.rotateY(Math.PI / 4);
    const beamMat = new THREE.MeshBasicMaterial({ color: '#FDE68A', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
    own.push(beamMat);
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.z = Math.PI;                 // apex at the tube
    beam.position.y = -51 + beamLen / 2;
    carm.add(beam);
    const beamEdges = new THREE.LineSegments(new THREE.EdgesGeometry(beamGeo), new THREE.LineBasicMaterial({ color: '#FDE68A', transparent: true, opacity: 0.4 }));
    beamEdges.rotation.copy(beam.rotation); beamEdges.position.copy(beam.position); carm.add(beamEdges);
    // central ray: tube focal spot → isocentre → detector
    const ray0 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -51, 0), new THREE.Vector3(0, 41.4, 0)]);
    const centralRay = new THREE.Line(ray0, new THREE.LineDashedMaterial({ color: '#FDE68A', dashSize: 3, gapSize: 2, transparent: true, opacity: 0.8 }));
    centralRay.computeLineDistances(); carm.add(centralRay);
    carm.position.copy(ISO);
    scene.add(carm);

    // stand: floor base at the head end, a column, and an arm that holds the C at its back
    const standMat = mat({ color: '#CBD5E1', roughness: 0.45, metalness: 0.3 });
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(26, 30, 8, 32), standMat);
    standBase.position.set(ISO.x - 150, FLOOR + 4, ISO.z + 70); scene.add(standBase);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(9, 11, 1, 24), standMat); scene.add(column);
    let arm = null;

    // floor orientation words
    const tHead = floorText('HEAD ⬅', '#34E39A'); tHead.position.set(ISO.x - 95, FLOOR + 0.5, -45); scene.add(tHead);
    const tLeft = floorText("PATIENT'S LEFT", '#22D3EE'); tLeft.position.set(ISO.x + 40, FLOOR + 0.5, -70); scene.add(tLeft);
    const tRight = floorText("PATIENT'S RIGHT", '#F472B6'); tRight.position.set(ISO.x + 40, FLOOR + 0.5, 70); tRight.rotation.z = Math.PI; scene.add(tRight);

    // ceiling-boom monitor showing the live image
    const screenTex = new THREE.CanvasTexture(screen);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    const monitor = new THREE.Group();
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(70, 46, 4), mat({ color: '#111827', roughness: 0.5 }));
    monitor.add(bezel);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(66, 42), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
    face.position.z = 2.1; monitor.add(face);
    const tag = label('CLICK THE SCREEN ⤢', { color: '#F5C451', size: 52 }); tag.position.set(0, -29, 3); tag.scale.multiplyScalar(0.8); monitor.add(tag);
    monitor.position.set(ISO.x + 25, ISO.y + 78, ISO.z - 105);
    monitor.lookAt(ISO.x + 250, ISO.y + 120, ISO.z + 170);
    scene.add(monitor);
    const boom = tubeBetween(new THREE.Vector3(ISO.x + 25, ISO.y + 100, ISO.z - 105), new THREE.Vector3(ISO.x + 25, ISO.y + 260, ISO.z - 105), 2.4, standMat);
    scene.add(boom);

    // camera orbit (operator's eye by default: patient's right, toward the feet)
    const orbit = { az: 0.9, el: 0.36, r: 300, target: new THREE.Vector3(ISO.x + 5, ISO.y + 2, ISO.z) };
    const place = () => {
      const { az, el: e, r, target } = orbit;
      camera.position.set(target.x + r * Math.cos(e) * Math.sin(az), target.y + r * Math.sin(e), target.z + r * Math.cos(e) * Math.cos(az));
      camera.lookAt(target);
    };
    place();

    const ray = new THREE.Raycaster();
    let drag = null;
    const onDown = e => { drag = { x: e.clientX, y: e.clientY, moved: false }; renderer.domElement.setPointerCapture?.(e.pointerId); };
    const onMove = e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      drag.x = e.clientX; drag.y = e.clientY;
      orbit.az -= dx * 0.008;
      orbit.el = Math.max(-0.15, Math.min(1.35, orbit.el + dy * 0.006));
      place();
    };
    const onUp = e => {
      if (drag && !drag.moved) {
        const r = renderer.domElement.getBoundingClientRect();
        ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
        if (ray.intersectObjects([face, bezel, tag], false).length) S.current.onScreenClick?.();
      }
      drag = null;
    };
    const onWheel = e => { e.preventDefault(); orbit.r = Math.max(160, Math.min(620, orbit.r * (1 + Math.sign(e.deltaY) * 0.08))); place(); };
    const cv = renderer.domElement;
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('wheel', onWheel, { passive: false });
    cv.addEventListener('pointercancel', () => { drag = null; });   // the browser took the gesture for scrolling

    const resize = () => {
      const w = el.clientWidth || 600;
      renderer.setSize(w, height, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = height + 'px';
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    // smooth the C-arm toward the requested angles, as a real gantry moves
    const cur = { lao: S.current.lao, cra: S.current.cra };
    let raf, last = performance.now(), frame = 0;
    const tmpM = new THREE.Matrix4();
    const loop = now => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const k = 1 - Math.exp(-dt * 7);
      cur.lao += (S.current.lao - cur.lao) * k;
      cur.cra += (S.current.cra - cur.cra) * k;
      const B = basis(cur.lao, cur.cra);
      const y = W(B.viewer).normalize(), x = W(B.right).normalize();
      const z = new THREE.Vector3().crossVectors(x, y);
      tmpM.makeBasis(x, y, z);
      carm.quaternion.setFromRotationMatrix(tmpM);
      // the arm from the column to the back of the C
      const back = new THREE.Vector3(-RC - 5, 0, 0).applyQuaternion(carm.quaternion).add(ISO);
      const colTop = new THREE.Vector3(standBase.position.x, back.y, standBase.position.z);
      column.scale.y = Math.max(1, colTop.y - FLOOR);
      column.position.set(standBase.position.x, (colTop.y + FLOOR) / 2, standBase.position.z);
      if (arm) { scene.remove(arm); arm.geometry.dispose(); }
      arm = tubeBetween(colTop, back, 6, standMat); scene.add(arm);
      // vessels of the injected system glow; the other dims
      for (const m of vesselMeshes) {
        const on = m.userData.system === S.current.system;
        m.material.opacity = on ? 1 : 0.25; m.material.transparent = !on;
        m.material.emissiveIntensity = on ? (S.current.injecting ? 0.9 : 0.55) : 0.15;
      }
      beamMat.opacity = S.current.injecting ? 0.2 + 0.06 * Math.sin(now / 60) : 0.12;
      heart.scale.set(radii[0] * (1 + 0.02 * Math.sin(now / 1000 * 7.5)), radii[1], radii[2]);
      if (frame++ % 2 === 0) screenTex.needsUpdate = true;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerup', onUp); cv.removeEventListener('wheel', onWheel);
      scene.traverse(o => { o.geometry?.dispose?.(); if (o.material?.map) o.material.map.dispose(); });
      own.forEach(m => m.dispose());
      screenTex.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [screen, height]);

  return <div ref={host} className="ca-3d" aria-label="3D cath lab: drag to look around, click the monitor to enlarge it" />;
}
