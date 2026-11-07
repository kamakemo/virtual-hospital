import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { A, M0, L0, APEX, AV, AO, LA_C, RA_C, RV_C, RV_AX, RV_FRAME, THROMBUS, DESC_AO, sys, HR } from './heart.js';
import { SECTOR } from './views.js';

/* ============================================================
   ECHO CASE 01 — THE STUDY IN 3D
   The patient on the couch, a see-through beating heart, the
   probe on the chest with its index marker, and the fan of the
   ultrasound beam cutting through the heart — so the learner
   sees which slice of the heart the screen is showing.
   Patient frame → world: cranial → −X, anterior → +Y, left → −Z.
   ============================================================ */

const W = p => new THREE.Vector3(-p[1], p[2], -p[0]);
const CTR = W([2.6, -4.6, 0.6]);
const COUCH_TOP = -12.5;
const FLOOR = COUCH_TOP - 70;

function label(text, color = '#E9F2FC', size = 56) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(5,11,22,0.8)'; g.beginPath(); g.roundRect(4, 4, 504, 120, 26); g.fill();
  g.fillStyle = color; g.font = `800 ${size}px Archivo, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 67);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.renderOrder = 20; s.scale.set(16, 4, 1);
  return s;
}

/** Ellipsoid mesh with axes along three world directions. */
function ellipsoid(center, ax, radii, mat) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), mat);
  m.position.copy(center);
  const x = ax[0].clone().normalize(), y = ax[1].clone().normalize(), z = new THREE.Vector3().crossVectors(x, y);
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  m.scale.set(radii[0], radii[1], radii[2]);
  return m;
}

export default function Echo3D({ pose, depth, screen, onScreenClick, height = 430, close = false, frozen, phase }) {
  const host = useRef(null);
  const S = useRef({});
  Object.assign(S.current, { pose, depth, onScreenClick, close, frozen, phase });

  useEffect(() => {
    const el = host.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { display: 'block', touchAction: 'pan-y' });
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A1422');
    const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 3000);
    scene.add(new THREE.HemisphereLight('#DCEBFF', '#1B2433', 1.15));
    const key = new THREE.DirectionalLight('#FFFFFF', 1.5); key.position.set(80, 220, 140); scene.add(key);
    const own = [];
    const mat = o => { const m = new THREE.MeshStandardMaterial(o); own.push(m); return m; };

    // room: floor, couch
    const room = new THREE.Group(); scene.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), mat({ color: '#111C2B', roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR; room.add(floor);
    const grid = new THREE.GridHelper(700, 28, '#2DD4BF', '#1C2A3D'); grid.position.y = FLOOR + 0.2;
    grid.material.transparent = true; grid.material.opacity = 0.22; room.add(grid);
    const couch = new THREE.Mesh(new THREE.BoxGeometry(190, 6, 62), mat({ color: '#E7ECF2', roughness: 0.6 }));
    couch.position.set(30, COUCH_TOP - 3, 0); room.add(couch);
    const base = new THREE.Mesh(new THREE.BoxGeometry(120, 64, 40), mat({ color: '#9AA6B4', roughness: 0.5 }));
    base.position.set(30, (COUCH_TOP + FLOOR) / 2 - 3, 0); room.add(base);

    // the patient, translucent
    const skin = mat({ color: '#F2C7A5', roughness: 0.7, transparent: true, opacity: 0.2, depthWrite: false });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1, 8, 24), skin);
    torso.scale.set(10, 22, 17.5); torso.rotation.z = Math.PI / 2; torso.position.copy(W([0, -10, -2.8])); room.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 16), skin); head.position.copy(W([0, 33, -3.2])); room.add(head);
    const legs = new THREE.Mesh(new THREE.CapsuleGeometry(7, 70, 8, 16), skin); legs.rotation.z = Math.PI / 2;
    legs.position.copy(W([0, -82, -4.5])); legs.scale.set(1, 1, 2.1); room.add(legs);
    const wire = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1, 8, 24), new THREE.MeshBasicMaterial({ color: '#F2C7A5', wireframe: true, transparent: true, opacity: 0.08 }));
    wire.scale.copy(torso.scale); wire.rotation.copy(torso.rotation); wire.position.copy(torso.position); room.add(wire);

    // the heart (life size)
    const heart = new THREE.Group(); scene.add(heart);
    const wa = W(A).sub(W([0, 0, 0])).normalize();
    const lvMat = mat({ color: '#E11D48', transparent: true, opacity: 0.38, roughness: 0.45, depthWrite: false, emissive: '#5B0A1E', emissiveIntensity: 0.5 });
    const ortho = v => { const t = new THREE.Vector3(0, 1, 0); if (Math.abs(t.dot(v)) > 0.9) t.set(1, 0, 0); return t.sub(v.clone().multiplyScalar(t.dot(v))).normalize(); };
    const u = ortho(wa);
    const lv = ellipsoid(W(M0).add(wa.clone().multiplyScalar(0.25 * L0)), [wa, u], [0.75 * L0 + 1, 3.9, 3.9], lvMat); heart.add(lv);
    const rvAx = [W(RV_FRAME.a).sub(W([0, 0, 0])), W(RV_FRAME.b).sub(W([0, 0, 0]))];
    const rv = ellipsoid(W(RV_C), rvAx, [RV_AX.a + 0.4, RV_AX.s + 0.45, RV_AX.q + 0.45], mat({ color: '#3B82F6', transparent: true, opacity: 0.32, depthWrite: false, emissive: '#0B2A5B', emissiveIntensity: 0.5 }));
    heart.add(rv);
    const la = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), mat({ color: '#F472B6', transparent: true, opacity: 0.32, depthWrite: false })); la.position.copy(W(LA_C)); heart.add(la);
    const ra = new THREE.Mesh(new THREE.SphereGeometry(2.3, 24, 16), mat({ color: '#818CF8', transparent: true, opacity: 0.32, depthWrite: false })); ra.position.copy(W(RA_C)); heart.add(ra);
    const aoPts = [0, 1.5, 3.5, 6].map(h => W([AV[0] + AO[0] * h, AV[1] + AO[1] * h, AV[2] + AO[2] * h]));
    const ao = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(aoPts), 24, 1.6, 16), mat({ color: '#FCA5A5', transparent: true, opacity: 0.4, depthWrite: false }));
    heart.add(ao);
    const dao = new THREE.Mesh(new THREE.CylinderGeometry(DESC_AO.r, DESC_AO.r, 11, 16), mat({ color: '#FCA5A5', transparent: true, opacity: 0.18, depthWrite: false }));
    dao.position.copy(W([DESC_AO.x, -4, DESC_AO.z])); dao.rotation.z = Math.PI / 2; heart.add(dao);
    const thr = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), mat({ color: '#A855F7', emissive: '#6B21A8', emissiveIntensity: 0.8 }));
    thr.position.copy(W(THROMBUS)); heart.add(thr);
    const tags = [['LV', W([0, 1, 2].map(i => M0[i] + A[i] * 4.2)), '#FDA4AF'], ['RV', W(RV_C), '#93C5FD'], ['Apex', W([0, 1, 2].map(i => APEX[i] + A[i] * 1.6)), '#E9F2FC'], ['LA', W(LA_C), '#F9A8D4'], ['Aorta', W([0, 1, 2].map(i => AV[i] + AO[i] * 3)), '#FCA5A5']];
    const tagSprites = tags.map(([t, p, c]) => { const s = label(t, c, 64); s.position.copy(p); s.scale.set(4.4, 1.1, 1); heart.add(s); return s; });

    // the probe and its fan
    const probe = new THREE.Group(); scene.add(probe);
    const pMat = mat({ color: '#E5E7EB', roughness: 0.35, metalness: 0.1 });
    const handle = new THREE.Mesh(new THREE.CapsuleGeometry(1.0, 4, 8, 16), pMat); handle.position.y = -3.9; probe.add(handle);
    const headM = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.6, 1.6), mat({ color: '#334155', roughness: 0.4 })); headM.position.y = -0.8; probe.add(headM);
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), mat({ color: '#34E39A', emissive: '#16A34A', emissiveIntensity: 0.9 }));
    marker.position.set(1.6, -1.2, 0); probe.add(marker);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 30, 8), mat({ color: '#475569' })); cable.position.y = -21; probe.add(cable);
    const fanMat = new THREE.MeshBasicMaterial({ color: '#22D3EE', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
    own.push(fanMat);
    let fan = null, fanEdge = null;
    const buildFan = d => {
      if (fan) { probe.remove(fan, fanEdge); fan.geometry.dispose(); fanEdge.geometry.dispose(); }
      const geo = new THREE.CircleGeometry(d, 48, (90 - SECTOR) * Math.PI / 180, 2 * SECTOR * Math.PI / 180);
      fan = new THREE.Mesh(geo, fanMat); fan.renderOrder = 5; probe.add(fan);
      fanEdge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: '#67E8F9', transparent: true, opacity: 0.85 }));
      probe.add(fanEdge);
    };
    let fanDepth = -1;

    // the echo machine with the live screen
    const machine = new THREE.Group(); room.add(machine);
    const cart = new THREE.Mesh(new THREE.BoxGeometry(30, 70, 40), mat({ color: '#CBD5E1', roughness: 0.5 })); cart.position.y = FLOOR + 35; machine.add(cart);
    const screenTex = new THREE.CanvasTexture(screen); screenTex.colorSpace = THREE.SRGBColorSpace;
    const mon = new THREE.Group(); machine.add(mon);
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(46, 34, 3), mat({ color: '#111827' })); mon.add(bezel);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(43, 31), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })); face.position.z = 1.6; mon.add(face);
    const tip = label('CLICK THE SCREEN ⤢', '#F5C451', 44); tip.position.set(0, -21, 2); tip.scale.set(14, 3.5, 1); mon.add(tip);
    mon.position.y = FLOOR + 98;
    machine.position.set(CTR.x - 55, 0, CTR.z + 70);
    mon.lookAt(new THREE.Vector3(CTR.x + 160, FLOOR + 110, CTR.z + 160).sub(machine.position));

    // camera orbit
    const orbit = { az: 0.75, el: 0.55, r: 130 };
    const target = new THREE.Vector3();
    const place = () => {
      const c = S.current.close;
      target.copy(c ? W([0, 1, 2].map(i => M0[i] + A[i] * 3.2)) : CTR);
      const r = c ? orbit.r * 0.36 : orbit.r;
      camera.position.set(target.x + r * Math.cos(orbit.el) * Math.sin(orbit.az), target.y + r * Math.sin(orbit.el), target.z + r * Math.cos(orbit.el) * Math.cos(orbit.az));
      camera.lookAt(target);
    };
    const ray = new THREE.Raycaster();
    let drag = null;
    const cv = renderer.domElement;
    const onDown = e => { drag = { x: e.clientX, y: e.clientY, moved: false }; };
    const onMove = e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      drag.x = e.clientX; drag.y = e.clientY;
      orbit.az -= dx * 0.008; orbit.el = Math.max(-0.3, Math.min(1.4, orbit.el + dy * 0.006));
    };
    const onUp = e => {
      if (drag && !drag.moved && !S.current.close) {
        const r = cv.getBoundingClientRect();
        ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
        if (ray.intersectObjects([face, bezel, tip], false).length) S.current.onScreenClick?.();
      }
      drag = null;
    };
    const onWheel = e => { e.preventDefault(); orbit.r = Math.max(90, Math.min(420, orbit.r * (1 + Math.sign(e.deltaY) * 0.08))); };
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', () => { drag = null; });
    cv.addEventListener('wheel', onWheel, { passive: false });

    const resize = () => {
      const w = el.clientWidth || 600;
      renderer.setSize(w, height, false);
      Object.assign(cv.style, { width: '100%', height: height + 'px' });
      camera.aspect = w / height; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    const m4 = new THREE.Matrix4();
    let raf, frame = 0;
    const t0 = performance.now();
    const loop = now => {
      raf = requestAnimationFrame(loop);
      const st = S.current;
      room.visible = !st.close;
      tagSprites.forEach(s => { s.visible = st.close; });
      const ph = st.frozen ? st.phase : (now / 1000 * HR / 60) % 1;   // same clock as the screen
      const s = sys(ph);
      lv.scale.set(0.75 * L0 + 1 - 0.5 * s, 3.9 - 0.4 * s, 3.9 - 0.4 * s);
      rv.scale.set(RV_AX.a + 0.4, (RV_AX.s + 0.45) * (1 - 0.1 * s), (RV_AX.q + 0.45) * (1 - 0.1 * s));
      // probe pose: local X = lateral (marker side), Y = beam, Z = normal
      const P = st.pose;
      const x = W(P.l).sub(W([0, 0, 0])), y = W(P.b).sub(W([0, 0, 0])), z = new THREE.Vector3().crossVectors(x, y);
      m4.makeBasis(x, y, z);
      probe.quaternion.setFromRotationMatrix(m4);
      probe.position.copy(W(P.S));
      if (fanDepth !== st.depth) { fanDepth = st.depth; buildFan(st.depth); }
      place();
      if (frame++ % 2 === 0) screenTex.needsUpdate = true;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerup', onUp); cv.removeEventListener('wheel', onWheel);
      scene.traverse(o => { o.geometry?.dispose?.(); if (o.material?.map) o.material.map.dispose(); });
      own.forEach(m => m.dispose()); screenTex.dispose(); renderer.dispose();
      el.removeChild(cv);
    };
  }, [screen, height]);

  return <div ref={host} className="ec-3d" aria-label="3D echo study: drag to look around, click the echo machine screen to enlarge it" />;
}
