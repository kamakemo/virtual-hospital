import * as THREE from 'three';
import { MAT, box, rbox, cyl, plane, part, tube } from './kit.js';

/** All generated resources belong to the lab instance and are freed on exit. */
export function cathMaterials(own) {
  const weave = document.createElement('canvas');
  weave.width = weave.height = 256;
  const g = weave.getContext('2d');
  g.fillStyle = '#6495bd';
  g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 256; k += 2) {
    g.strokeStyle = k % 4 ? '#ffffff0b' : '#071b2c0a';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k, 256);
    g.moveTo(0, k);
    g.lineTo(256, k);
    g.stroke();
  }
  const color = new THREE.CanvasTexture(weave);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.repeat.set(3, 3);
  const bump = color.clone();
  bump.colorSpace = THREE.NoColorSpace;
  bump.needsUpdate = true;
  const cloth = new THREE.MeshStandardMaterial({
    map: color,
    bumpMap: bump,
    bumpScale: 0.0015,
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const lead = new THREE.MeshStandardMaterial({
    color: '#707c8a',
    roughness: 0.88,
    side: THREE.DoubleSide,
  });
  own.push(color, bump, cloth, lead);
  return { cloth, lead };
}

export function panelTexture(
  own,
  title,
  { dark = false, controls = false } = {},
) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  g.fillStyle = dark ? '#172633' : '#dee4e8';
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = dark ? '#aac6d5' : '#3c5260';
  g.font = '600 24px Arial';
  g.fillText(title, 24, 38);
  g.fillStyle = dark ? '#3e5c6c' : '#a3b2bb';
  g.fillRect(24, 54, 464, 2);
  if (controls) {
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 110;
      g.fillStyle = '#87959e';
      g.beginPath();
      g.arc(x, 115, 27, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#f0f3f5';
      g.beginPath();
      g.arc(x, 115, 21, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#425663';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x, 98);
      g.lineTo(x, 113);
      g.stroke();
      g.fillStyle = '#344b59';
      g.font = '16px Arial';
      g.fillText(['HEIGHT', 'FLOAT', 'C-ARM', 'LOCK'][i], x - 30, 162);
    }
    g.fillStyle = '#347b95';
    g.fillRect(30, 192, 245, 36);
    g.fillStyle = '#dbf1f7';
    g.font = '18px monospace';
    g.fillText('TABLE READY', 42, 216);
    g.fillStyle = '#c87a32';
    g.beginPath();
    g.arc(438, 208, 18, 0, Math.PI * 2);
    g.fill();
  } else {
    g.font = '16px monospace';
    g.fillText('VIRTUAL HOSPITAL · SIMULATION', 24, 92);
    g.fillText('REF  CV-04   /   CLASS I EQUIPMENT', 24, 125);
    for (let i = 0; i < 64; i++) {
      g.fillRect(24 + i * 4, 174, (i % 3) + 1, 42);
    }
    g.font = '14px monospace';
    g.fillText('CV04-000128', 330, 213);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  own.push(tex);
  return tex;
}

export function label(own, tex, w, h, x, y, z, ry = 0) {
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.65 });
  own.push(mat);
  return part(plane(w, h), mat, x, y, z, 0, ry, 0);
}

/** Soft contact shading is deliberately cheap: one shared alpha texture and
 * no extra shadow render passes on lower-powered devices. */
export function contactShadows(own, footprints) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gradient = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(12,22,30,.32)');
  gradient.addColorStop(0.5, 'rgba(12,22,30,.13)');
  gradient.addColorStop(1, 'rgba(12,22,30,0)');
  g.fillStyle = gradient;
  g.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  own.push(texture, mat);
  const group = new THREE.Group();
  for (const [x, z, w, d] of footprints) {
    const geo = new THREE.PlaneGeometry(w, d);
    const m = part(geo, mat, x, 0.009, z, -Math.PI / 2, 0, 0);
    m.renderOrder = 1;
    group.add(m);
  }
  return group;
}

/** Sewn fabric hanging from a horizontal rail; folds deepen toward the hem. */
export function hangingCloth(own, material, width, drop, x, y, z, ry = 0) {
  const geo = new THREE.PlaneGeometry(width, drop, Math.ceil(width * 36), 12);
  own.push(geo);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i),
      v = (drop / 2 - pos.getY(i)) / drop;
    pos.setZ(
      i,
      (Math.sin(u * 36) * 0.012 + Math.sin(u * 13 + 0.5) * 0.016) * v,
    );
    pos.setY(i, pos.getY(i) + Math.sin(u * 17) * 0.014 * v);
  }
  geo.computeVertexNormals();
  const mesh = part(geo, material, x, y - drop / 2, z, 0, ry, 0);
  return mesh;
}

export function consoleCart(own, x, z, screen, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  g.add(part(rbox(0.58, 0.65, 0.58, 0.045), MAT.plastic(), 0, 0.48, 0));
  g.add(part(rbox(0.65, 0.06, 0.64, 0.02), MAT.lightGrey(), 0, 0.12, 0));
  for (const dx of [-0.24, 0.24])
    for (const dz of [-0.23, 0.23]) {
      g.add(part(cyl(0.02, 0.02, 0.1, 10), MAT.steel(), dx, 0.085, dz));
      g.add(
        part(
          cyl(0.045, 0.045, 0.036, 14),
          MAT.castor(),
          dx,
          0.045,
          dz,
          Math.PI / 2,
        ),
      );
    }
  for (let i = 0; i < 10; i++)
    g.add(
      part(
        box(0.18, 0.009, 0.008),
        MAT.paint('#64717b', 0.6),
        -0.12,
        0.34 + i * 0.018,
        0.294,
      ),
    );
  g.add(
    label(
      own,
      panelTexture(own, 'IMAGING CONSOLE'),
      0.23,
      0.115,
      0.13,
      0.38,
      0.295,
    ),
  );
  g.add(part(rbox(0.46, 0.045, 0.34, 0.015), MAT.lightGrey(), 0, 0.85, 0.18));
  for (let i = 0; i < 12; i++)
    g.add(
      part(
        box(0.025, 0.008, 0.022),
        MAT.charcoal(),
        -0.15 + (i % 6) * 0.045,
        0.876,
        0.1 + Math.floor(i / 6) * 0.038,
      ),
    );
  g.add(part(cyl(0.028, 0.028, 0.27, 12), MAT.steel(), 0, 1.02, -0.09));
  const display = new THREE.Group();
  display.position.set(0, 1.25, -0.09);
  display.rotation.x = -0.13;
  display.add(part(rbox(0.53, 0.36, 0.045, 0.022), MAT.charcoal(), 0, 0, 0));
  display.add(part(plane(0.47, 0.3), screen, 0, 0, 0.024));
  g.add(display);
  for (const dx of [-0.25, 0.25])
    g.add(
      part(cyl(0.012, 0.012, 0.31, 10), MAT.chrome(), dx, 0.77, 0, Math.PI / 2),
    );
  return g;
}

export function storageCabinet(own, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const white = MAT.paint('#e6ebee', 0.4);
  g.add(
    part(box(1.12, 2.25, 0.035), MAT.paint('#A9B5BF', 0.75), 0, 1.2, -0.25),
  );
  for (const dx of [-0.56, 0.56])
    g.add(part(box(0.045, 2.25, 0.55), white, dx, 1.2, 0));
  for (const y of [0.075, 0.61, 2.31])
    g.add(part(box(1.16, 0.045, 0.55), white, 0, y, 0));
  g.add(part(rbox(1.08, 0.45, 0.5, 0.01), white, 0, 0.34, 0));
  for (const y of [0.21, 0.44]) {
    g.add(part(box(1.06, 0.012, 0.008), MAT.grey(), 0, y, 0.254));
    g.add(part(box(0.38, 0.018, 0.03), MAT.steel(), 0, y + 0.055, 0.27));
  }
  for (let j = 0; j < 4; j++) {
    const y = 0.76 + j * 0.38;
    g.add(part(box(1.05, 0.018, 0.48), MAT.lightGrey(), 0, y, 0));
    for (let i = 0; i < 4; i++) {
      const color = ['#bed5e4', '#e5dfcc', '#cbded6', '#d9e0e6'][(i + j) % 4];
      g.add(
        part(
          rbox(0.19, 0.23, 0.22, 0.008),
          MAT.paint(color, 0.8),
          -0.39 + i * 0.26,
          y + 0.13,
          0,
        ),
      );
      g.add(
        part(
          box(0.12, 0.05, 0.005),
          MAT.linen(),
          -0.39 + i * 0.26,
          y + 0.16,
          0.114,
        ),
      );
    }
  }
  for (const dx of [-0.27, 0.27]) {
    g.add(part(box(0.5, 1.55, 0.008), MAT.glassClear(), dx, 1.48, 0.276));
    for (const ex of [-0.255, 0.255])
      g.add(part(box(0.018, 1.58, 0.016), white, dx + ex, 1.48, 0.286));
    g.add(
      part(
        cyl(0.007, 0.007, 0.22, 10),
        MAT.chrome(),
        dx + (dx < 0 ? 0.19 : -0.19),
        1.42,
        0.31,
      ),
    );
  }
  g.add(
    label(
      own,
      panelTexture(own, 'STERILE SUPPLIES'),
      0.66,
      0.12,
      0,
      2.17,
      0.288,
    ),
  );
  return g;
}

export function controlStation(own, z, screen) {
  const g = new THREE.Group();
  for (const dx of [5.48, 6.03])
    g.add(part(box(0.04, 0.72, 0.04), MAT.steel(), dx, 0.36, z));
  g.add(part(box(0.09, 0.035, 0.2), MAT.charcoal(), 5.65, 0.83, z));
  g.add(part(cyl(0.016, 0.016, 0.18, 8), MAT.steel(), 5.65, 0.91, z));
  g.add(part(rbox(0.045, 0.4, 0.67, 0.015), MAT.charcoal(), 5.65, 1.12, z));
  g.add(part(plane(0.61, 0.345), screen, 5.624, 1.12, z, 0, -Math.PI / 2));
  g.add(part(rbox(0.18, 0.018, 0.45, 0.005), MAT.charcoal(), 5.91, 0.8, z));
  for (let i = 0; i < 15; i++)
    g.add(
      part(
        box(0.025, 0.004, 0.025),
        MAT.grey(),
        5.85 + (i % 3) * 0.035,
        0.812,
        z - 0.18 + Math.floor(i / 3) * 0.075,
      ),
    );
  // Five-star base and upholstered seat, facing the desk/window.
  const cx = 6.62,
    cz = z + 0.15;
  g.add(part(cyl(0.03, 0.03, 0.42, 12), MAT.chrome(), cx, 0.25, cz));
  for (let k = 0; k < 5; k++) {
    const a = (k * Math.PI * 2) / 5;
    g.add(
      new THREE.Mesh(
        tube(
          [
            [cx, 0.1, cz],
            [cx + Math.cos(a) * 0.28, 0.09, cz + Math.sin(a) * 0.28],
          ],
          0.015,
          4,
        ),
        MAT.steel(),
      ),
    );
    g.add(
      part(
        cyl(0.035, 0.035, 0.035, 10),
        MAT.castor(),
        cx + Math.cos(a) * 0.28,
        0.045,
        cz + Math.sin(a) * 0.28,
        Math.PI / 2,
      ),
    );
  }
  g.add(
    part(rbox(0.46, 0.075, 0.48, 0.04), MAT.upholstery('#303d49'), cx, 0.5, cz),
  );
  g.add(
    part(
      rbox(0.055, 0.56, 0.42, 0.035),
      MAT.upholstery('#303d49'),
      cx + 0.22,
      0.85,
      cz,
    ),
  );
  for (const dz of [-0.26, 0.26])
    g.add(
      part(rbox(0.31, 0.025, 0.045, 0.012), MAT.charcoal(), cx, 0.68, cz + dz),
    );
  return g;
}
