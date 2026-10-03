import * as THREE from 'three';

function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

/** Deliberately synthetic coronary projections, with named vessel paths rather
 * than fractal branches. These are room scenery, not diagnostic case images. */
function projection(w, h, view) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d'),
    random = rng(83 + view);
  const gradient = g.createRadialGradient(
    w * 0.52,
    h * 0.48,
    10,
    w * 0.5,
    h * 0.5,
    w * 0.65,
  );
  gradient.addColorStop(0, '#b9bbc0');
  gradient.addColorStop(0.75, '#777b82');
  gradient.addColorStop(1, '#30343b');
  g.fillStyle = gradient;
  g.fillRect(0, 0, w, h);
  g.save();
  g.scale(w, h);
  g.fillStyle = '#292d3528';
  g.beginPath();
  g.ellipse(0.53, 0.61, 0.27, 0.35, -0.25, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#ecedf016';
  g.lineWidth = 0.025;
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.ellipse(0.46, -0.08 + i * 0.18, 0.59, 0.19, -0.12, 0.12, Math.PI - 0.12);
    g.stroke();
  }
  // Left main, LAD/diagonals and circumflex/obtuse marginals in two views;
  // the third projection depicts the RCA and distal bifurcation.
  const left =
    view === 1
      ? [
          ['M .39 .22 C .42 .26 .46 .29 .5 .32', 0.014],
          ['M .5 .32 C .59 .4 .53 .53 .64 .64 S .7 .8 .68 .9', 0.012],
          ['M .56 .44 C .68 .43 .72 .52 .83 .56', 0.007],
          ['M .6 .59 C .72 .58 .78 .69 .88 .7', 0.005],
          ['M .5 .32 C .4 .37 .32 .41 .32 .54 S .4 .66 .38 .77', 0.011],
          ['M .32 .49 C .23 .5 .2 .6 .17 .7', 0.006],
          ['M .34 .61 C .24 .63 .27 .76 .21 .82', 0.005],
        ]
      : [
          ['M .44 .2 C .43 .27 .43 .29 .46 .34', 0.014],
          ['M .46 .34 C .5 .45 .48 .54 .57 .64 S .69 .8 .68 .91', 0.012],
          ['M .5 .45 C .62 .45 .67 .5 .76 .62', 0.007],
          ['M .52 .58 C .64 .6 .68 .68 .8 .75', 0.005],
          ['M .46 .34 C .34 .34 .22 .41 .23 .53 S .33 .65 .4 .74', 0.011],
          ['M .23 .48 C .18 .55 .11 .56 .12 .72', 0.006],
          ['M .27 .6 C .2 .67 .24 .74 .29 .82', 0.005],
        ];
  const right = [
    [
      'M .42 .22 C .26 .22 .21 .35 .28 .49 S .34 .73 .5 .77 S .77 .72 .81 .61',
      0.013,
    ],
    ['M .28 .45 C .18 .49 .19 .61 .23 .66', 0.006],
    ['M .43 .75 C .38 .8 .41 .9 .44 .94', 0.006],
    ['M .64 .77 C .72 .83 .74 .91 .8 .94', 0.006],
    ['M .72 .72 C .82 .75 .89 .79 .94 .77', 0.004],
  ];
  g.strokeStyle = '#141820';
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const [d, width] of view === 2 ? right : left) {
    const path = new Path2D(d);
    g.lineWidth = width * 1.75;
    g.globalAlpha = 0.15;
    g.stroke(path);
    g.lineWidth = width;
    g.globalAlpha = 0.88;
    g.stroke(path);
    g.lineWidth = width * 0.4;
    g.globalAlpha = 0.28;
    g.stroke(path);
  }
  g.globalAlpha = 0.75;
  g.lineWidth = 0.003;
  g.strokeStyle = '#292e38';
  g.beginPath();
  g.moveTo(0.51, -0.02);
  g.bezierCurveTo(0.53, 0.12, 0.31, 0.13, view === 1 ? 0.39 : 0.44, 0.22);
  g.stroke();
  g.restore();
  // Low-contrast fluoroscopic grain, fixed across frames to avoid distracting flicker.
  for (let i = 0; i < (w * h) / 5; i++) {
    g.fillStyle = random() < 0.5 ? '#ffffff0b' : '#0000000c';
    g.fillRect(random() * w, random() * h, 1, 1);
  }
  return canvas;
}

export function labDisplay() {
  const W = 1536,
    H = 800,
    B = 12;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const tw = (W - 4 * B) / 3,
    th = (H - 3 * B) / 2;
  const projections = [0, 1, 2].map((i) =>
    projection(Math.ceil(tw), Math.ceil(th), i),
  );
  const cell = (col, row) => [B + col * (tw + B), B + row * (th + B)];
  const font = (size, weight = 500) => `${weight} ${size}px monospace`;
  const annotate = (x, y, name, footer) => {
    g.fillStyle = '#060b12b8';
    g.fillRect(x, y, tw, 29);
    g.fillRect(x, y + th - 25, tw, 25);
    g.font = font(15);
    g.fillStyle = '#e7edf3';
    g.fillText(name, x + 12, y + 20);
    g.fillStyle = '#a8bbc9';
    g.font = font(12);
    g.fillText(footer, x + 12, y + th - 8);
  };
  // Seeded IVUS speckle is generated once, not thousands of times per frame.
  const ivus = document.createElement('canvas');
  ivus.width = ivus.height = 320;
  const v = ivus.getContext('2d'),
    random = rng(220);
  v.fillStyle = '#020406';
  v.fillRect(0, 0, 320, 320);
  for (let i = 0; i < 19000; i++) {
    const angle = random() * Math.PI * 2,
      radius = Math.sqrt(random()) * 150;
    v.fillStyle = `rgba(215,230,239,${radius > 52 ? random() * 0.45 : random() * 0.08})`;
    v.fillRect(
      160 + Math.cos(angle) * radius,
      160 + Math.sin(angle) * radius,
      1.4,
      1.4,
    );
  }
  v.lineWidth = 7;
  v.strokeStyle = '#e3e8ee';
  v.beginPath();
  v.arc(160, 160, 82, -0.8, 2.7);
  v.stroke();
  v.fillStyle = '#0b1118';
  v.beginPath();
  v.arc(160, 160, 8, 0, Math.PI * 2);
  v.fill();
  const gaussian = (x, mu, spread, amplitude) =>
    amplitude * Math.exp(-(((x - mu) / spread) ** 2));
  const ecg = (p) =>
    gaussian(p, 0.12, 0.035, 0.15) -
    gaussian(p, 0.22, 0.013, 0.2) +
    gaussian(p, 0.245, 0.012, 1) -
    gaussian(p, 0.27, 0.018, 0.3) +
    gaussian(p, 0.43, 0.065, 0.27);
  const pressure = (p) =>
    p < 0.18
      ? Math.sin(((p / 0.18) * Math.PI) / 2)
      : p < 0.33
        ? 1 - (p - 0.18) * 2
        : p < 0.4
          ? 0.65 + Math.sin(((p - 0.33) / 0.07) * Math.PI) * 0.12
          : 0.65 * Math.exp(-(p - 0.4) * 2.4);
  const pleth = (p) =>
    p < 0.24 ? Math.sin(((p / 0.24) * Math.PI) / 2) : Math.exp(-(p - 0.24) * 4);
  // All bedside displays share this patient's haemodynamic panel, so the
  // small monitors and the ceiling bank always agree and animate together.
  const monitorCanvas = document.createElement('canvas');
  monitorCanvas.width = 512;
  monitorCanvas.height = 320;
  const monitorContext = monitorCanvas.getContext('2d');
  const monitorTexture = new THREE.CanvasTexture(monitorCanvas);
  monitorTexture.colorSpace = THREE.SRGBColorSpace;
  let last = -1;
  let atlas = null;
  let disposed = false;
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => {
    if (disposed) return;
    atlas = image;
    last = -1;
    draw(0);
  };
  // Same-origin, retained asset: no third-party request is needed in the room.
  image.src = `${import.meta.env.BASE_URL}images/cath/coronary-simulation-atlas.png`;
  function draw(t) {
    if (t - last < 0.1) return;
    last = t;
    g.fillStyle = '#030609';
    g.fillRect(0, 0, W, H);
    for (const [col, row, view, title] of [
      [0, 0, 0, 'SIMULATED CINE · LCA VIEW 01'],
      [1, 0, 1, 'SIMULATED REFERENCE · LCA VIEW 02'],
      [2, 1, 2, 'SIMULATED RCA VIEW'],
    ]) {
      const [x, y] = cell(col, row);
      g.save();
      g.beginPath();
      g.rect(x, y, tw, th);
      g.clip();
      const motion =
        col === 0 ? Math.sin((t * Math.PI * 2 * 84) / 60) * 1.2 : 0;
      if (atlas) {
        const panelWidth = atlas.naturalWidth / 3;
        g.drawImage(
          atlas,
          view * panelWidth + 2,
          2,
          panelWidth - 4,
          atlas.naturalHeight - 4,
          x + motion - 2,
          y - 2,
          tw + 4,
          th + 4,
        );
      } else {
        g.drawImage(projections[view], x + motion - 2, y - 2, tw + 4, th + 4);
      }
      g.restore();
      annotate(x, y, title, 'ILLUSTRATIVE SIMULATION · SYNTHETIC IMAGERY');
    }
    let [x, y] = cell(2, 0);
    annotate(x, y, 'HAEMODYNAMICS', 'SIMULATED PATIENT · NORMAL SINUS RHYTHM');
    const waveRows = [
      [ecg, '#53df8c', 'ECG II', '84'],
      [pressure, '#f3726f', 'ART mmHg', '132/74'],
      [pleth, '#63cdec', 'SpO₂ %', '97'],
    ];
    waveRows.forEach(([fn, color, label, value], i) => {
      const yy = y + 100 + i * 104;
      g.fillStyle = '#36505b';
      g.font = font(13);
      g.fillText(label, x + 12, yy - 44);
      g.strokeStyle = color;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k < tw - 150; k += 2) {
        const phase = ((((t * 84) / 60 - (tw - 150 - k) / 110) % 1) + 1) % 1;
        const py = yy - fn(phase) * 35;
        k ? g.lineTo(x + 12 + k, py) : g.moveTo(x + 12, py);
      }
      g.stroke();
      g.fillStyle = color;
      g.font = font(i === 1 ? 29 : 39, 700);
      g.textAlign = 'right';
      g.fillText(value, x + tw - 12, yy - 8);
      g.textAlign = 'left';
    });
    [x, y] = cell(0, 1);
    annotate(x, y, 'PROCEDURE RECORD', 'SIMULATION · EDUCATIONAL ENVIRONMENT');
    for (const [i, [label, value, unit]] of [
      ['Heart rate', '84', 'bpm'],
      ['Arterial pressure', '132 / 74', 'mmHg'],
      ['Contrast', '72', 'mL'],
      ['ACT', '268', 's'],
      ['Air kerma', '412', 'mGy'],
    ].entries()) {
      const yy = y + 65 + i * 60;
      g.strokeStyle = '#182a35';
      g.beginPath();
      g.moveTo(x + 12, yy + 20);
      g.lineTo(x + tw - 12, yy + 20);
      g.stroke();
      g.font = font(16);
      g.fillStyle = '#8199aa';
      g.fillText(label, x + 16, yy);
      g.textAlign = 'right';
      g.font = font(24, 600);
      g.fillStyle = '#e6eef3';
      g.fillText(`${value} ${unit}`, x + tw - 16, yy);
      g.textAlign = 'left';
    }
    [x, y] = cell(1, 1);
    annotate(x, y, 'INTRAVASCULAR ULTRASOUND', 'SIMULATED IVUS · 60 MHz');
    g.drawImage(ivus, x + 12, y + 42, 290, 290);
    g.font = font(16);
    g.fillStyle = '#91bedc';
    g.fillText('MLA', x + 324, y + 112);
    g.fillText('1.9 mm²', x + 324, y + 140);
    g.fillText('Ca arc', x + 324, y + 194);
    g.fillText('360°', x + 324, y + 222);
    texture.needsUpdate = true;
    const [mx, my] = cell(2, 0);
    monitorContext.drawImage(c, mx, my, tw, th, 0, 0, 512, 320);
    monitorTexture.needsUpdate = true;
  }
  draw(0);
  return {
    texture,
    monitorTexture,
    draw,
    aspect: W / H,
    dispose() {
      disposed = true;
      image.onload = null;
      atlas = null;
    },
  };
}
