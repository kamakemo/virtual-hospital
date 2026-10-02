import * as THREE from 'three';

/* ============================================================
   TEXTURES
   Every surface is painted procedurally on a canvas — no image
   files to ship, nothing to 404, and every material can be tuned
   in code. Colour maps are tagged sRGB; data maps are linear.
   ============================================================ */

let ANISO = 4;
export function setAnisotropy(n) { ANISO = Math.max(1, Math.min(16, n || 1)); }

function make(w, h, draw, { repeat = null, srgb = true, mips = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.anisotropy = ANISO;
  t.generateMipmaps = mips;
  return t;
}

/* Small deterministic PRNG so textures look identical on every load. */
function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const cache = new Map();
function cached(key, fn) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
}

/* ---------- floors, walls, ceiling ---------- */

/** Sheet vinyl: warm light grey with a fine terrazzo-like fleck. */
export const vinyl = (tone = '#CFCBC5') => cached('vinyl' + tone, () => make(512, 512, (g, w, h) => {
  g.fillStyle = tone; g.fillRect(0, 0, w, h);
  const r = rng(7);
  for (let i = 0; i < 5200; i++) {
    const v = r();
    g.fillStyle = v < 0.5 ? `rgba(255,255,255,${0.05 + r() * 0.12})` : `rgba(60,55,50,${0.03 + r() * 0.08})`;
    const s = 0.6 + r() * 1.8;
    g.fillRect(r() * w, r() * h, s, s);
  }
  // very soft mottling so large areas don't look flat
  for (let i = 0; i < 40; i++) {
    const x = r() * w, y = r() * h, rad = 40 + r() * 90;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(255,255,255,${0.025 + r() * 0.03})`);
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  }
}, { repeat: [6, 6] }));

/** Light oak plank flooring, as laid under the bays in the reference photos. */
export const wood = (base = '#C9A57A') => cached('wood' + base, () => make(512, 1024, (g, w, h) => {
  const r = rng(11);
  const plankW = w / 4;
  for (let p = 0; p < 4; p++) {
    let y = -r() * 300;
    while (y < h) {
      const len = 260 + r() * 340;
      const shade = (r() - 0.5) * 22;
      const c = new THREE.Color(base).offsetHSL(0, (r() - 0.5) * 0.04, shade / 255);
      g.fillStyle = '#' + c.getHexString();
      g.fillRect(p * plankW, y, plankW, len);
      // grain
      for (let k = 0; k < 26; k++) {
        g.strokeStyle = `rgba(90,60,30,${0.05 + r() * 0.09})`;
        g.lineWidth = 0.6 + r() * 1.4;
        g.beginPath();
        const gx = p * plankW + r() * plankW;
        g.moveTo(gx, y);
        for (let s = 0; s <= len; s += 24) g.lineTo(gx + Math.sin((s + k * 13) / 40) * (2 + r() * 3), y + s);
        g.stroke();
      }
      g.fillStyle = 'rgba(60,40,20,0.35)';
      g.fillRect(p * plankW, y, plankW, 1.5);
      y += len;
    }
    g.fillStyle = 'rgba(60,40,20,0.3)';
    g.fillRect(p * plankW, 0, 1.5, h);
  }
}, { repeat: [1, 1] }));

/** 600 mm suspended ceiling tiles with fissured mineral fibre. */
export const ceilingTiles = () => cached('ceil', () => make(512, 512, (g, w, h) => {
  g.fillStyle = '#F2F1EE'; g.fillRect(0, 0, w, h);
  const r = rng(3);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(150,145,138,${0.05 + r() * 0.1})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2.5, 0.8);
  }
  g.strokeStyle = '#D9D6D0'; g.lineWidth = 6;
  g.strokeRect(0, 0, w, h);
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 2;
  g.strokeRect(4, 4, w - 8, h - 8);
}, { repeat: [1, 1] }));

/** 600 mm porcelain floor tiles with fine grout — the reference general wards. */
export const floorTiles = (tone = '#DCD3C4') => cached('ftile' + tone, () => make(512, 512, (g, w, h) => {
  g.fillStyle = '#B9B0A2'; g.fillRect(0, 0, w, h);
  const r = rng(13);
  const n = 2, s = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const c = new THREE.Color(tone).offsetHSL(0, 0, (r() - 0.5) * 0.025);
    g.fillStyle = '#' + c.getHexString();
    g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
    for (let k = 0; k < 900; k++) {
      g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '90,80,70'},${0.03 + r() * 0.05})`;
      g.fillRect(i * s + r() * s, j * s + r() * s, 1.5, 1.5);
    }
  }
}, { repeat: [1, 1] }));

/** Glazed white wall tiles behind the beds, grout lines included. */
export const wallTiles = () => cached('wtile', () => make(512, 512, (g, w, h) => {
  g.fillStyle = '#C9CED2'; g.fillRect(0, 0, w, h);
  const n = 4, s = w / n, r = rng(5);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = 246 + Math.floor(r() * 7);
    g.fillStyle = `rgb(${v},${v},${v + 1})`;
    g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
    const grd = g.createLinearGradient(i * s, j * s, i * s + s, j * s + s);
    grd.addColorStop(0, 'rgba(255,255,255,0.5)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
  }
}, { repeat: [1, 1] }));

/** Painted plaster: near-flat cream with the faintest roller texture. */
export const plaster = (tone = '#EEE8DE') => cached('plaster' + tone, () => make(256, 256, (g, w, h) => {
  g.fillStyle = tone; g.fillRect(0, 0, w, h);
  const r = rng(9);
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)';
    g.fillRect(r() * w, r() * h, 2, 2);
  }
}, { repeat: [8, 2] }));

/* ---------- fabric ---------- */

/**
 * Privacy curtain. A fine-mesh band at the top (as on every hospital
 * curtain), then fabric with a soft weave. Emergency curtains are two-tone
 * cream over grey, exactly like the reference ED.
 */
export const curtain = (kind, base) => cached('curt' + kind + base, () => make(256, 512, (g, w, h) => {
  const meshH = h * 0.16;
  if (kind === 'emergency') {
    g.fillStyle = '#EDE3C7'; g.fillRect(0, meshH, w, h * 0.32);
    g.fillStyle = '#8F9399'; g.fillRect(0, meshH + h * 0.32, w, h);
  } else {
    g.fillStyle = base; g.fillRect(0, meshH, w, h);
  }
  // weave
  const r = rng(21);
  for (let x = 0; x < w; x += 2) {
    g.fillStyle = `rgba(255,255,255,${0.025 + r() * 0.04})`;
    g.fillRect(x, meshH, 1, h);
  }
  for (let y = meshH; y < h; y += 3) {
    g.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.03})`;
    g.fillRect(0, y, w, 1);
  }
  // mesh band: open net, mostly transparent
  g.clearRect(0, 0, w, meshH);
  g.strokeStyle = 'rgba(235,238,240,0.8)'; g.lineWidth = 1;
  for (let x = 0; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, meshH); g.stroke(); }
  for (let y = 0; y < meshH; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = 'rgba(245,245,245,0.95)'; g.fillRect(0, 0, w, 6);
  g.fillRect(0, meshH - 3, w, 4);
}, { repeat: [1, 1] }));

/** Hospital gown: pale blue cotton with the small repeating diamond print. */
export const gownPrint = () => cached('gown', () => make(256, 256, (g, w, h) => {
  g.fillStyle = '#A7C3D8'; g.fillRect(0, 0, w, h);
  const r = rng(101);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.06})`; g.fillRect(r() * w, r() * h, 1, 1); }
  const s = 32;
  for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
    const ox = (y / s) % 2 ? s / 2 : 0;
    g.fillStyle = '#5B7FA3';
    g.beginPath();
    const cx = x + ox + s / 2, cy = y + s / 2;
    g.moveTo(cx, cy - 4); g.lineTo(cx + 4, cy); g.lineTo(cx, cy + 4); g.lineTo(cx - 4, cy); g.closePath(); g.fill();
    g.fillStyle = '#EAF1F6'; g.fillRect(cx - 1, cy - 1, 2, 2);
  }
}, { repeat: [3, 3] }));

/** Cellular cotton blanket: the open waffle weave of every ward. */
export const cellularBlanket = (tone = '#EEF2F4') => cached('blanket' + tone, () => make(256, 256, (g, w, h) => {
  g.fillStyle = tone; g.fillRect(0, 0, w, h);
  const s = 16;
  for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
    const grd = g.createRadialGradient(x + s / 2, y + s / 2, 1, x + s / 2, y + s / 2, s * 0.55);
    grd.addColorStop(0, 'rgba(70,90,110,0.22)');
    grd.addColorStop(1, 'rgba(70,90,110,0)');
    g.fillStyle = grd; g.fillRect(x, y, s, s);
  }
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2;
  for (let i = 0; i <= w; i += s) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
}, { repeat: [6, 6] }));

/** Short hair, as fine strands over a darker root tone. */
export const hairStrands = (base) => cached('hair' + base, () => make(512, 512, (g, w, h) => {
  const c = new THREE.Color(base);
  g.fillStyle = '#' + c.clone().multiplyScalar(0.7).getHexString(); g.fillRect(0, 0, w, h);
  const r = rng(111);
  for (let i = 0; i < 9000; i++) {
    const t = c.clone().offsetHSL(0, 0, (r() - 0.4) * 0.16);
    g.strokeStyle = '#' + t.getHexString();
    g.globalAlpha = 0.35 + r() * 0.5;
    g.lineWidth = 0.6 + r() * 0.8;
    const x = r() * w, y = r() * h, a = r() * Math.PI * 2, l = 4 + r() * 9;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  g.globalAlpha = 1;
}, { repeat: [1, 1] }));

/** Non-woven theatre cap fabric. */
export const capFabric = () => cached('capfab', () => make(256, 256, (g, w, h) => {
  g.fillStyle = '#86B9DE'; g.fillRect(0, 0, w, h);
  const r = rng(121);
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(30,70,110,0.08)';
    g.fillRect(r() * w, r() * h, 1 + r() * 3, 1);
  }
}, { repeat: [1, 1] }));

/* ---------- signage ---------- */

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}

function fitText(g, text, maxW, size, weight = 600, family = 'Archivo, Arial, sans-serif') {
  let s = size;
  do { g.font = `${weight} ${s}px ${family}`; s -= 2; } while (g.measureText(text).width > maxW && s > 10);
  return s + 2;
}

function wrap(g, text, maxW) {
  const words = text.split(/\s+/); const lines = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Hanging department sign: charcoal panel, white type, a hue stripe. */
export function deptSign(name, hue, sub) {
  return make(1024, 192, (g, w, h) => {
    g.fillStyle = '#2B3138'; roundRect(g, 0, 0, w, h, 14); g.fill();
    g.fillStyle = hue; g.fillRect(0, h - 14, w, 14);
    g.fillStyle = '#FFFFFF';
    fitText(g, name.toUpperCase(), w - 80, 64, 700);
    g.textBaseline = 'middle'; g.textAlign = 'center';
    g.fillText(name.toUpperCase(), w / 2, sub ? h * 0.4 : h * 0.47);
    if (sub) {
      g.font = '500 30px Archivo, Arial, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.7)';
      g.fillText(sub, w / 2, h * 0.74);
    }
  }, { mips: true });
}

/** The red "Bed-03" wall plaque straight out of the reference ward. */
export function bedPlaque(n) {
  return cached('plaque' + n, () => make(256, 96, (g, w, h) => {
    g.fillStyle = '#FFFFFF'; roundRect(g, 0, 0, w, h, 8); g.fill();
    g.fillStyle = '#C8302A'; roundRect(g, 5, 5, w - 10, h - 10, 6); g.fill();
    g.fillStyle = '#FFFFFF'; g.font = '700 50px Archivo, Arial, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(`Bed-${String(n).padStart(2, '0')}`, w / 2, h / 2 + 2);
  }));
}

/**
 * Bedside identification board — the whiteboard above every bed. Carries the
 * bed number, the department, and the case header. Nothing else.
 */
export function idBoard({ bed, unit, header, hue }) {
  return make(768, 512, (g, w, h) => {
    g.fillStyle = '#B9C0C6'; roundRect(g, 0, 0, w, h, 18); g.fill();
    g.fillStyle = '#FBFCFC'; roundRect(g, 10, 10, w - 20, h - 20, 12); g.fill();
    g.fillStyle = hue; roundRect(g, 10, 10, w - 20, 92, 12); g.fill();
    g.fillRect(10, 60, w - 20, 42);

    g.fillStyle = '#FFFFFF'; g.textBaseline = 'middle';
    g.font = '700 46px Archivo, Arial, sans-serif'; g.textAlign = 'left';
    g.fillText(`BED ${String(bed).padStart(2, '0')}`, 40, 58);
    g.textAlign = 'right'; g.font = '600 24px Archivo, Arial, sans-serif';
    fitText(g, unit.toUpperCase(), 420, 24, 600);
    g.fillText(unit.toUpperCase(), w - 40, 58);

    g.textAlign = 'left'; g.fillStyle = '#7C8790';
    g.font = '600 22px Archivo, Arial, sans-serif';
    g.fillText('PATIENT', 40, 146);

    g.fillStyle = '#16212A';
    const text = header || 'Case to be assigned';
    let size = 46;
    let lines;
    do {
      g.font = `600 ${size}px Archivo, Arial, sans-serif`;
      lines = wrap(g, text, w - 80);
      size -= 2;
    } while (lines.length * (size * 1.22) > 230 && size > 22);
    const lh = (size + 2) * 1.22;
    lines.slice(0, 5).forEach((l, i) => g.fillText(l, 40, 196 + i * lh));
    if (!header) { g.fillStyle = '#9AA4AC'; }

    // marker tray
    g.fillStyle = '#A9B1B8'; g.fillRect(40, h - 46, w - 80, 14);
    [['#1F6FD1', 80], ['#C8302A', 130], ['#2A8C4A', 180]].forEach(([c, x]) => {
      g.fillStyle = c; roundRect(g, x, h - 58, 36, 12, 5); g.fill();
    });
  });
}

/** Wayfinding sign (green exit, hand hygiene, etc). */
export function smallSign(text, bg = '#1E7A3E', fg = '#FFFFFF', w = 512, h = 160) {
  return make(w, h, (g) => {
    g.fillStyle = bg; roundRect(g, 0, 0, w, h, 12); g.fill();
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, text, w - 50, 64, 700);
    g.fillText(text, w / 2, h / 2 + 3);
  });
}

/* ---------- screens ---------- */

/**
 * Bedside monitor. One live canvas per variant, shared by every monitor of
 * that variant, redrawn each frame: ECG, pleth, resp, and the numbers.
 */
export function liveMonitor(variant = 0) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = ANISO;
  const hr = [74, 92, 108][variant % 3];
  const spo2 = [98, 95, 93][variant % 3];
  const bp = ['124/78', '108/66', '96/58'][variant % 3];

  const ecg = p => {
    const x = p % 1;
    if (x < 0.1) return Math.sin(x / 0.1 * Math.PI) * 0.12;
    if (x < 0.16) return 0;
    if (x < 0.18) return -0.15;
    if (x < 0.21) return 1;
    if (x < 0.24) return -0.35;
    if (x < 0.3) return 0;
    if (x < 0.45) return Math.sin((x - 0.3) / 0.15 * Math.PI) * 0.25;
    return 0;
  };
  const pleth = p => { const x = p % 1; return x < 0.3 ? Math.sin(x / 0.3 * Math.PI / 2) : Math.max(0, 1 - (x - 0.3) / 0.7 * 1.1) + (x > 0.42 && x < 0.5 ? 0.12 : 0); };

  function draw(t) {
    g.fillStyle = '#050A0E'; g.fillRect(0, 0, 512, 320);
    const rate = hr / 60;
    const rows = [
      { y: 60, amp: 42, color: '#38E07A', fn: ecg, speed: rate },
      { y: 150, amp: 30, color: '#3ED0F5', fn: pleth, speed: rate },
      { y: 228, amp: 16, color: '#F2D24B', fn: p => Math.sin(p * Math.PI * 2), speed: 0.27 },
    ];
    const sweepX = ((t * 70) % 360);
    for (const r of rows) {
      g.strokeStyle = r.color; g.lineWidth = 2.2; g.beginPath();
      for (let x = 0; x <= 360; x += 2) {
        if (Math.abs(x - sweepX) < 10) { g.stroke(); g.beginPath(); continue; }
        const age = x <= sweepX ? (sweepX - x) : (sweepX + 360 - x);
        const p = (t - age / 70) * r.speed;
        const y = r.y - r.fn(p) * r.amp;
        x === 0 ? g.moveTo(x + 8, y) : g.lineTo(x + 8, y);
      }
      g.stroke();
    }
    g.fillStyle = '#121B22'; g.fillRect(372, 0, 140, 320);
    g.textAlign = 'right';
    g.fillStyle = '#38E07A'; g.font = '700 58px "IBM Plex Mono", monospace'; g.fillText(String(hr), 500, 82);
    g.font = '500 16px Archivo, sans-serif'; g.fillText('HR', 500, 26);
    g.fillStyle = '#3ED0F5'; g.font = '700 50px "IBM Plex Mono", monospace'; g.fillText(String(spo2), 500, 168);
    g.font = '500 16px Archivo, sans-serif'; g.fillText('SpO₂', 500, 116);
    g.fillStyle = '#E8ECEF'; g.font = '700 30px "IBM Plex Mono", monospace'; g.fillText(bp, 500, 246);
    g.font = '500 16px Archivo, sans-serif'; g.fillText('NIBP', 500, 200);
    g.fillStyle = '#F2D24B'; g.font = '700 26px "IBM Plex Mono", monospace'; g.fillText('16', 500, 300);
    tex.needsUpdate = true;
  }
  draw(0);
  return { texture: tex, draw };
}

/** Ventilator touchscreen: pressure and flow loops on a dark UI. */
export const ventScreen = () => cached('vent', () => make(512, 384, (g, w, h) => {
  g.fillStyle = '#0A1620'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#16303F'; g.fillRect(0, 0, w, 44);
  g.fillStyle = '#E8F1F6'; g.font = '600 22px Archivo, sans-serif'; g.fillText('PC-AC   Adult', 16, 29);
  const curve = (y0, amp, color, fn) => {
    g.strokeStyle = color; g.lineWidth = 2.5; g.beginPath();
    for (let x = 0; x < 340; x++) { const y = y0 - fn(x / 340) * amp; x ? g.lineTo(16 + x, y) : g.moveTo(16, y); }
    g.stroke();
  };
  curve(150, 70, '#F2C14B', p => { const x = (p * 3) % 1; return x < 0.35 ? Math.min(1, x / 0.08) : 0.15; });
  curve(280, 60, '#3ED0F5', p => { const x = (p * 3) % 1; return x < 0.35 ? 1 - x / 0.35 : -Math.exp(-(x - 0.35) * 9); });
  g.textAlign = 'right';
  [['PEEP', '8'], ['FiO₂', '40'], ['Vt', '450'], ['RR', '16']].forEach(([k, v], i) => {
    g.fillStyle = '#7FA3B8'; g.font = '500 16px Archivo, sans-serif'; g.fillText(k, 496, 84 + i * 76);
    g.fillStyle = '#FFFFFF'; g.font = '700 34px "IBM Plex Mono", monospace'; g.fillText(v, 496, 118 + i * 76);
  });
}));

/** Infusion pump LCD. */
export const pumpScreen = () => cached('pump', () => make(128, 64, (g, w, h) => {
  g.fillStyle = '#9FD3A8'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#123018'; g.font = '700 26px "IBM Plex Mono", monospace';
  g.fillText('12.5', 10, 34); g.font = '600 13px Archivo, sans-serif'; g.fillText('mL/h  RUN', 10, 54);
}));

/** Nurse-station workstation display: a plain EHR-style layout. */
export const workstationScreen = () => cached('ws', () => make(256, 160, (g, w, h) => {
  g.fillStyle = '#F4F7F9'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1F5E78'; g.fillRect(0, 0, w, 20);
  g.fillStyle = '#DDE5EA'; g.fillRect(0, 20, 54, h);
  const r = rng(31);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = i % 2 ? '#FFFFFF' : '#EEF3F6'; g.fillRect(60, 28 + i * 14, w - 66, 13);
    g.fillStyle = '#8796A2'; g.fillRect(66, 33 + i * 14, 40 + r() * 80, 3);
  }
}));

/** Daylight beyond the ward's end windows: sky, far trees, a hint of city. */
export const windowView = () => cached('wview', () => make(1024, 512, (g, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#9FC6E8'); sky.addColorStop(0.6, '#DCEBF5'); sky.addColorStop(1, '#EEF3F2');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  const r = rng(41);
  for (let i = 0; i < 18; i++) {
    const bw = 40 + r() * 90, bh = 60 + r() * 180, x = r() * w;
    g.fillStyle = `rgba(176,190,204,${0.4 + r() * 0.3})`; g.fillRect(x, h * 0.72 - bh, bw, bh);
  }
  for (let i = 0; i < 70; i++) {
    const x = r() * w, y = h * 0.74 + r() * 30, rad = 22 + r() * 40;
    g.fillStyle = `rgba(${90 + r() * 40},${130 + r() * 40},${90 + r() * 30},0.9)`;
    g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#B7C2A8'; g.fillRect(0, h * 0.86, w, h);
}));

/* ---------- exterior ---------- */

export const grass = () => cached('grass', () => make(512, 512, (g, w, h) => {
  g.fillStyle = '#6C8F4E'; g.fillRect(0, 0, w, h);
  const r = rng(51);
  for (let i = 0; i < 16000; i++) {
    const v = r();
    g.fillStyle = v < 0.5 ? `rgba(130,170,90,${0.15 + r() * 0.25})` : `rgba(60,90,40,${0.12 + r() * 0.2})`;
    g.fillRect(r() * w, r() * h, 1.2, 2.5 + r() * 2);
  }
}, { repeat: [24, 24] }));

export const paving = () => cached('pave', () => make(512, 512, (g, w, h) => {
  g.fillStyle = '#B9B3A8'; g.fillRect(0, 0, w, h);
  const r = rng(61);
  const s = 64;
  for (let i = 0; i < w / s; i++) for (let j = 0; j < h / (s / 2); j++) {
    const v = 196 + Math.floor(r() * 26);
    g.fillStyle = `rgb(${v},${v - 6},${v - 14})`;
    const off = (j % 2) * s / 2;
    g.fillRect(i * s + off + 1.5, j * s / 2 + 1.5, s - 3, s / 2 - 3);
  }
}, { repeat: [10, 10] }));

export const asphalt = () => cached('asph', () => make(512, 512, (g, w, h) => {
  g.fillStyle = '#4A4D51'; g.fillRect(0, 0, w, h);
  const r = rng(71);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},${0.03 + r() * 0.05})`;
    g.fillRect(r() * w, r() * h, 1.5, 1.5);
  }
}, { repeat: [8, 8] }));

/**
 * A storey of ribbon glazing: mullions every 1.5 m, a transom, and
 * interior shading — blinds part-drawn, ceiling lights glimpsed — so the
 * glass reads as occupied rather than mirrored.
 */
export const ribbonGlass = (seed = 1) => cached('rglass' + seed, () => make(1024, 128, (g, w, h) => {
  const r = rng(80 + seed);
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#5D7C92'); sky.addColorStop(1, '#2E4252');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  const bays = 16, bw = w / bays;
  for (let i = 0; i < bays; i++) {
    const blind = r() * 0.6;
    g.fillStyle = `rgba(232,228,214,${0.55 + r() * 0.3})`;
    g.fillRect(i * bw, 0, bw, h * blind);
    if (r() < 0.6) { g.fillStyle = 'rgba(255,248,224,0.35)'; g.fillRect(i * bw + bw * 0.2, h * 0.08, bw * 0.6, 4); }
    const ref = g.createLinearGradient(i * bw, 0, i * bw + bw, h);
    ref.addColorStop(0, 'rgba(210,230,245,0.28)'); ref.addColorStop(0.5, 'rgba(210,230,245,0)');
    g.fillStyle = ref; g.fillRect(i * bw, 0, bw, h);
  }
  g.fillStyle = '#C9CDD0';
  for (let i = 0; i <= bays; i++) g.fillRect(i * bw - 3, 0, 6, h);
  g.fillRect(0, h * 0.22, w, 4);
}, { repeat: [1, 1] }));

/** Atrium curtain wall: tall panes, slim silver mullions, lobby glow behind. */
export const curtainWall = () => cached('cwall', () => make(512, 1024, (g, w, h) => {
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#7E9DB4'); bg.addColorStop(0.5, '#AFC6D6'); bg.addColorStop(1, '#5F7F96');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const r = rng(91);
  const cols = 6, rows = 18;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    if (r() < 0.25) { g.fillStyle = `rgba(255,244,214,${0.12 + r() * 0.18})`; g.fillRect(i * w / cols, j * h / rows, w / cols, h / rows); }
  }
  g.fillStyle = '#D8DCDF';
  for (let i = 0; i <= cols; i++) g.fillRect(i * w / cols - 3, 0, 6, h);
  for (let j = 0; j <= rows; j++) g.fillRect(0, j * h / rows - 2, w, 4);
}, { repeat: [1, 1] }));

/** Rooftop helipad marking. */
export const helipad = () => cached('heli', () => make(512, 512, (g, w, h) => {
  g.fillStyle = '#5E6266'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#E9C23F'; g.lineWidth = 16;
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.42, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#FFFFFF'; g.font = '800 300px Archivo, Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', w / 2, h / 2 + 14);
}));

/** Large illuminated building lettering. */
export function lettering(text, color = '#1D4FA8', w = 2048, h = 256) {
  return make(w, h, (g) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, text, w - 60, 200, 800);
    g.fillText(text, w / 2, h / 2 + 8);
  }, { mips: true });
}
