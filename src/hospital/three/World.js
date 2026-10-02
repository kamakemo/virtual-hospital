import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { setAnisotropy } from './textures.js';
import { buildExterior } from './exterior.js';
import { buildWard } from './ward.js';
import { loadPatientAssets } from './patientAssets.js';
import { pad2 } from '../data.js';

/* ============================================================
   WORLD
   Owns the renderer, the camera and the two kinds of scene —
   the building outside, and whichever ward is open — and moves
   the camera between them. React drives it through a handful of
   methods and listens through callbacks; it never re-renders per
   frame.
   ============================================================ */

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isCoarse = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export class World {
  constructor({ canvas, labels, wings, on }) {
    this.canvas = canvas;
    this.labels = labels;
    this.on = on;
    this.mode = 'building';
    this.coarse = isCoarse();
    this.tweens = [];
    this.look = new THREE.Vector3();
    this.lookOffset = { yaw: 0, pitch: 0, yawT: 0, pitchT: 0 };
    this.hover = null;
    this.frame = 0;
    this.clock = new THREE.Clock();

    /* renderer */
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.coarse ? 1.5 : 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    setAnisotropy(r.capabilities.getMaxAnisotropy());

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.5, 3000);

    // the scanned head loads in the background while the visitor is outside
    this.assetsReady = loadPatientAssets(r);

    /* the building */
    this.exterior = buildExterior(wings);
    this.outside = new THREE.Scene();
    this.outside.add(this.exterior.group, this.exterior.sky);
    this.outside.fog = new THREE.Fog('#DCE7EE', 320, 1100);
    if (this.coarse) this.exterior.shadowLight.shadow.mapSize.set(1024, 1024);

    const pmrem = new THREE.PMREMGenerator(r);
    const skyScene = new THREE.Scene();
    skyScene.add(this.exterior.sky.clone());
    this.outside.environment = pmrem.fromScene(skyScene, 0.02).texture;
    this.indoorEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    /* the ward (built on demand) */
    this.inside = new THREE.Scene();
    this.inside.background = new THREE.Color('#EDEBE6');
    this.inside.environment = this.indoorEnv;
    this.inside.environmentIntensity = 0.5;
    this.ward = null;

    /* orbit around the building */
    const c = this.controls = new OrbitControls(this.camera, canvas);
    c.enableDamping = true;
    c.dampingFactor = 0.06;
    c.enablePan = false;
    c.minDistance = 95;
    c.maxDistance = 240;
    c.minPolarAngle = THREE.MathUtils.degToRad(58);
    c.maxPolarAngle = THREE.MathUtils.degToRad(87);
    c.minAzimuthAngle = THREE.MathUtils.degToRad(-75);
    c.maxAzimuthAngle = THREE.MathUtils.degToRad(75);
    c.autoRotate = true;
    c.autoRotateSpeed = 0.35;
    c.target.copy(this.exterior.home.target);
    c.addEventListener('start', () => { c.autoRotate = false; clearTimeout(this.idle); });
    c.addEventListener('end', () => { clearTimeout(this.idle); this.idle = setTimeout(() => { if (this.mode === 'building') c.autoRotate = true; }, 9000); });

    /* input */
    this.ray = new THREE.Raycaster();
    this.ptr = new THREE.Vector2();
    this.down = null;
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onLeave = () => this.setHover(null);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onLeave);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement);
    this.resize();

    // arrive: a slow dolly in from further out
    const home = this.exterior.home;
    this.camera.position.copy(home.pos).sub(home.target).multiplyScalar(1.45).add(home.target).add(new THREE.Vector3(0, 30, 0));
    this.look.copy(home.target);
    this.camera.lookAt(this.look);
    this.controls.enabled = false;
    this.tweenCamera(home.pos, home.target, 2600, 0).then(() => {
      this.controls.enabled = this.mode === 'building';
      this.controls.target.copy(home.target);
    });

    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
    on.ready?.();
  }

  /* ---------- sizing ---------- */

  resize() {
    const el = this.canvas.parentElement;
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.applyFov();
  }

  /** Keep enough of the scene in frame on narrow (portrait) screens. */
  applyFov() {
    const a = this.camera.aspect;
    let fov;
    if (this.mode === 'building') {
      // hold ~44° horizontally so the whole building fits a phone held upright
      fov = a >= 1.25 ? 40 : THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(22)) / a));
      fov = clamp(fov, 38, 82);
    } else if (this.mode === 'ward') {
      fov = a >= 1.3 ? 56 : clamp(56 + (1.3 - a) * 30, 56, 78);
    } else {
      fov = a >= 1.3 ? 48 : clamp(48 + (1.3 - a) * 34, 48, 74);
    }
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  /* ---------- camera moves ---------- */

  tweenCamera(toPos, toTarget, ms = 1200, arc = 0) {
    this.tweens.length = 0;
    const fromPos = this.camera.position.clone();
    const fromLook = this.look.clone();
    const start = performance.now();
    return new Promise(resolve => {
      this.tweens.push(now => {
        const t = clamp((now - start) / ms, 0, 1);
        const e = ease(t);
        this.camera.position.lerpVectors(fromPos, toPos, e);
        this.camera.position.y += Math.sin(Math.PI * e) * arc;
        this.look.lerpVectors(fromLook, toTarget, e);
        if (t >= 1) { resolve(); return true; }
        return false;
      });
    });
  }

  /** Building → a floor's façade, ahead of the elevator. */
  async flyToFloor(wingId, number) {
    const f = this.exterior.floors.find(x => x.wingId === wingId && x.number === number);
    if (!f || this.mode !== 'building') return;
    this.controls.enabled = false;
    this.controls.autoRotate = false;
    const target = f.centre.clone();
    const pos = target.clone().add(new THREE.Vector3(f.centre.x > 0 ? 18 : -18, 4, 52));
    this.setFloorGlow(f, 1);
    await this.tweenCamera(pos, target, 950, 6);
  }

  /** Swap the scene to a department's ward, camera at the entrance. */
  enterFloor(floor) {
    this.clearWard();
    this.ward = buildWard(floor);
    this.inside.add(this.ward.group);
    if (this.coarse) this.ward.shadowLight.shadow.mapSize.set(1024, 1024);
    this.mode = 'ward';
    this.controls.enabled = false;
    this.renderer.toneMappingExposure = 1.14;   // ACES dulls bright interiors; lift them
    this.camera.near = 0.05;
    this.applyFov();
    this.camera.position.copy(this.ward.entry.pos);
    this.look.copy(this.ward.entry.target);
    // Held upright, a phone can't take in both rows at once: start turned
    // toward beds 1–6, and let the visitor drag across to the other side.
    const yaw0 = this.camera.aspect < 0.9 ? 0.55 : 0;
    Object.assign(this.lookOffset, { yaw: yaw0, pitch: 0, yawT: yaw0, pitchT: 0 });
    this.buildLabels();
    this.exterior.floors.forEach(f => this.setFloorGlow(f, 0, true));
  }

  showBuilding() {
    this.clearWard();
    this.mode = 'building';
    this.renderer.toneMappingExposure = 1.0;
    this.camera.near = 0.5;
    this.applyFov();
    const home = this.exterior.home;
    this.camera.position.copy(home.pos);
    this.look.copy(home.target);
    this.controls.target.copy(home.target);
    this.controls.enabled = true;
    this.controls.update();
    this.exterior.floors.forEach(f => this.setFloorGlow(f, 0, true));
  }

  async focusBed(index) {
    if (!this.ward) return;
    const b = this.ward.beds[index];
    if (!b) return;
    this.mode = 'bed';
    this.applyFov();
    this.setHover(null);
    this.lookOffset.yawT = 0; this.lookOffset.pitchT = 0;
    this.labels.classList.add('is-hidden');
    await this.tweenCamera(b.cam.pos, b.cam.target, 1250, 0.25);
  }

  async leaveBed() {
    if (!this.ward) return;
    this.mode = 'ward';
    this.applyFov();
    this.lookOffset.yawT = this.camera.aspect < 0.9 ? 0.55 : 0; this.lookOffset.pitchT = 0;
    await this.tweenCamera(this.ward.entry.pos, this.ward.entry.target, 1150, 0.2);
    this.labels.classList.remove('is-hidden');
  }

  clearWard() {
    if (this.ward) {
      this.inside.remove(this.ward.group);
      this.ward.dispose();
      this.ward = null;
    }
    this.labels.innerHTML = '';
    this.labels.classList.remove('is-hidden');
    this.labelEls = [];
  }

  /* ---------- bed labels ---------- */

  buildLabels() {
    this.labels.innerHTML = '';
    this.labelEls = this.ward.beds.map(b => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'bed-tag' + (b.occupied ? '' : ' is-empty');
      el.innerHTML = `<span>${pad2(b.number)}</span>`;
      el.setAttribute('aria-label', `Bed ${b.number}${b.header ? ' — ' + b.header : ' — available'}`);
      el.addEventListener('mouseenter', () => this.setHover({ type: 'bed', index: b.index }));
      el.addEventListener('mouseleave', () => this.setHover(null));
      el.addEventListener('click', () => this.on.selectBed?.(b.index));
      this.labels.appendChild(el);
      return el;
    });
  }

  placeLabels() {
    if (!this.ward || !this.labelEls?.length) return;
    const w = this.renderer.domElement.clientWidth, h = this.renderer.domElement.clientHeight;
    const v = new THREE.Vector3();
    this.ward.beds.forEach((b, i) => {
      const el = this.labelEls[i];
      v.copy(b.label).project(this.camera);
      const visible = v.z < 1 && v.x > -1.05 && v.x < 1.05 && v.y > -1.05 && v.y < 1.05;
      if (!visible) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; return; }
      const x = (v.x + 1) / 2 * w, y = (1 - v.y) / 2 * h;
      // nearer beds read slightly larger, like real signage
      const d = this.camera.position.distanceTo(b.label);
      const s = clamp(9 / d, 0.62, 1.15);
      el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
      el.style.opacity = '';
      el.style.pointerEvents = '';
      el.style.zIndex = String(1000 - Math.round(d * 10));
      el.classList.toggle('is-hot', this.hover?.type === 'bed' && this.hover.index === i);
    });
  }

  /* ---------- hover + pick ---------- */

  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.ptr.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(this.ptr, this.camera);
    if (this.mode === 'building') {
      const hits = this.ray.intersectObjects(this.exterior.floors.map(f => f.hit), false);
      if (!hits.length) return null;
      const { wingId, number } = hits[0].object.userData;
      return { type: 'floor', wingId, number };
    }
    if (this.mode === 'ward' && this.ward) {
      const hits = this.ray.intersectObjects(this.ward.beds.map(b => b.hit), false);
      if (!hits.length) return null;
      return { type: 'bed', index: hits[0].object.userData.bed };
    }
    return null;
  }

  setHover(h, clientX, clientY) {
    const same = h && this.hover && h.type === this.hover.type &&
      (h.type === 'bed' ? h.index === this.hover.index : h.wingId === this.hover.wingId && h.number === this.hover.number);
    if (!same) {
      this.hover = h;
      this.canvas.style.cursor = h ? 'pointer' : '';
    }
    if (h?.type === 'floor') {
      const f = this.exterior.floors.find(x => x.wingId === h.wingId && x.number === h.number);
      this.on.hover?.({ ...h, name: f?.name, hue: f?.hue, x: clientX, y: clientY });
    } else if (h?.type === 'bed') {
      const b = this.ward?.beds[h.index];
      this.on.hover?.({ ...h, number: b?.number, header: b?.header });
    } else {
      this.on.hover?.(null);
    }
  }

  /** Highlight a floor from outside the canvas (the elevator panel). */
  previewFloor(wingId, number) {
    if (this.mode !== 'building') return;
    this.hover = wingId ? { type: 'floor', wingId, number } : null;
  }

  onPointerDown(e) {
    this.down = { x: e.clientX, y: e.clientY, yaw: this.lookOffset.yawT, pitch: this.lookOffset.pitchT, moved: false };
  }

  onPointerMove(e) {
    if (this.down) {
      const dx = e.clientX - this.down.x, dy = e.clientY - this.down.y;
      if (Math.hypot(dx, dy) > 6) this.down.moved = true;
      // drag to look around inside the ward / at the bedside
      if (this.mode !== 'building' && this.down.moved && this.tweens.length === 0) {
        const range = this.mode === 'ward' ? { yaw: 1.0, pitch: 0.32 } : { yaw: 0.5, pitch: 0.22 };
        this.lookOffset.yawT = clamp(this.down.yaw - dx * 0.0042, -range.yaw, range.yaw);
        this.lookOffset.pitchT = clamp(this.down.pitch - dy * 0.0032, -range.pitch, range.pitch * 0.6);
      }
      return;
    }
    if (e.target !== this.canvas || this.tweens.length) return;
    this.setHover(this.pick(e.clientX, e.clientY), e.clientX, e.clientY);
  }

  onPointerUp(e) {
    const d = this.down;
    this.down = null;
    if (!d || d.moved || e.target !== this.canvas || this.tweens.length) return;
    const p = this.pick(e.clientX, e.clientY);
    if (!p) return;
    if (p.type === 'floor') this.on.selectFloor?.(p.wingId, p.number);
    if (p.type === 'bed') this.on.selectBed?.(p.index);
  }

  setFloorGlow(f, target, instant = false) {
    f.glowTarget = target;
    if (instant) f.glassMat.emissiveIntensity = target * 0.55;
  }

  /* ---------- frame loop ---------- */

  loop() {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    const now = performance.now();
    const t = this.clock.elapsedTime;
    this.frame++;

    if (this.tweens.length) {
      this.tweens = this.tweens.filter(fn => !fn(now));
      this.camera.lookAt(this.look);
      if (this.mode === 'building' && !this.tweens.length) this.controls.target.copy(this.look);
    } else if (this.mode === 'building') {
      if (this.controls.enabled) this.controls.update();
    } else {
      // smoothed look-around on top of the current view direction
      const o = this.lookOffset;
      o.yaw += (o.yawT - o.yaw) * Math.min(1, dt * 7);
      o.pitch += (o.pitchT - o.pitch) * Math.min(1, dt * 7);
      const dir = this.look.clone().sub(this.camera.position);
      const dist = dir.length();
      dir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), o.yaw);
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
      dir.applyAxisAngle(right, o.pitch);
      this.camera.lookAt(this.camera.position.clone().add(dir.multiplyScalar(dist)));
    }

    if (this.mode === 'building') {
      for (const f of this.exterior.floors) {
        const hot = this.hover?.type === 'floor' && this.hover.wingId === f.wingId && this.hover.number === f.number;
        const goal = Math.max(f.glowTarget || 0, hot ? 1 : 0) * 0.55;
        f.glassMat.emissiveIntensity += (goal - f.glassMat.emissiveIntensity) * Math.min(1, dt * 10);
      }
      this.renderer.render(this.outside, this.camera);
    } else if (this.ward) {
      for (const b of this.ward.beds) {
        const hot = this.mode === 'ward' && this.hover?.type === 'bed' && this.hover.index === b.index;
        const goal = hot ? 0.3 : 0;
        b.glow.material.opacity += (goal - b.glow.material.opacity) * Math.min(1, dt * 10);
      }
      // the bedside monitors: redrawn at half frame rate, which reads as live
      if (this.frame % 2 === 0) this.ward.update(t);
      this.renderer.render(this.inside, this.camera);
      this.placeLabels();
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointerleave', this.onLeave);
    this.controls.dispose();
    this.clearWard();
    this.exterior.dispose();
    this.outside.environment?.dispose();
    this.indoorEnv?.dispose();
    this.renderer.dispose();
  }
}
