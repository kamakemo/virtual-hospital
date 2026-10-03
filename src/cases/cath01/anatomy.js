/* ============================================================
   CASE 01 — ANATOMY
   This patient's coronary tree for the angiography simulator,
   the C-arm views a team would acquire, and his LAD as IVUS
   sees it at each point in the procedure.

   Coordinates are the patient frame used by the simulator:
   x = patient's left, y = cranial, z = anterior (≈ cm).
   LAD parameter t runs 0 (left main bifurcation) → 1 (apex).
   ============================================================ */

export const LAD_LESION = { t0: 0.14, t1: 0.36 };
export const D1_AT = 0.27;
export const STENT = { t0: 0.1, t1: 0.42 };
export const PERF_AT = 0.31;

export const TREE = {
  vessels: [
    { id: 'LM', system: 'left', label: 'LM', labelAt: 0.5, r0: 0.45, r1: 0.42, offset: 0,
      pts: [[0.4, 0, 0.1], [0.9, -0.15, 0.35], [1.4, -0.3, 0.6]] },
    { id: 'LAD', system: 'left', label: 'LAD', labelAt: 0.62, r0: 0.38, r1: 0.12, offset: 1.2, hazy: true,
      pts: [[1.4, -0.3, 0.6], [2.0, -0.9, 1.35], [2.45, -1.75, 1.95], [2.95, -3.0, 2.4], [3.45, -4.6, 2.55], [3.85, -6.3, 2.3], [4.0, -7.5, 1.8]],
      lesions: [{ ...LAD_LESION, sev: 0.88, calcified: true }] },
    { id: 'D1', system: 'left', label: 'D1', labelAt: 0.7, r0: 0.26, r1: 0.11, offset: 3.4,
      pts: [[2.45, -1.75, 1.95], [3.2, -2.3, 2.35], [4.0, -3.1, 2.3], [4.7, -4.1, 1.9]] },
    { id: 'S1', system: 'left', label: 'S1', labelAt: 0.6, r0: 0.14, r1: 0.06, offset: 2.8,
      pts: [[2.2, -1.35, 1.75], [2.1, -2.3, 1.0], [2.0, -3.2, 0.4]] },
    { id: 'D2', system: 'left', label: 'D2', labelAt: 0.7, r0: 0.16, r1: 0.07, offset: 5.0,
      pts: [[3.1, -3.4, 2.45], [3.9, -4.3, 2.35], [4.4, -5.2, 2.0]] },
    { id: 'LCx', system: 'left', label: 'LCx', labelAt: 0.45, r0: 0.33, r1: 0.14, offset: 1.2,
      pts: [[1.4, -0.3, 0.6], [2.3, -0.55, 0.05], [3.15, -1.1, -0.9], [3.6, -2.1, -1.9], [3.4, -3.1, -2.7]],
      lesions: [{ t0: 0.42, t1: 0.52, sev: 0.3 }] },
    { id: 'OM1', system: 'left', label: 'OM1', labelAt: 0.7, r0: 0.24, r1: 0.1, offset: 2.9,
      pts: [[3.15, -1.1, -0.9], [4.1, -2.2, -0.7], [4.7, -3.6, -0.3], [4.9, -4.8, 0.1]] },
    { id: 'OM2', system: 'left', r0: 0.17, r1: 0.08, offset: 4.2,
      pts: [[3.6, -2.1, -1.9], [4.3, -3.3, -1.6], [4.5, -4.5, -1.2]] },

    { id: 'RCA', system: 'right', label: 'RCA', labelAt: 0.28, r0: 0.4, r1: 0.26, offset: 0,
      pts: [[-0.35, 0, 0.25], [-1.3, -0.4, 1.05], [-2.2, -1.3, 1.25], [-2.75, -2.6, 0.9], [-2.95, -3.9, 0.0], [-2.4, -4.8, -1.1], [-1.2, -5.2, -1.8]],
      lesions: [{ t0: 0.38, t1: 0.48, sev: 0.6 }] },
    { id: 'CB', system: 'right', r0: 0.1, r1: 0.05, offset: 1.0, pts: [[-1.3, -0.4, 1.05], [-1.2, 0.3, 1.6], [-0.9, 0.9, 1.9]] },
    { id: 'PDA', system: 'right', label: 'PDA', labelAt: 0.5, r0: 0.2, r1: 0.08, offset: 9.0,
      pts: [[-1.2, -5.2, -1.8], [0.0, -6.0, -1.3], [1.2, -6.9, -0.6], [2.0, -7.5, 0.0]] },
    { id: 'PLV', system: 'right', label: 'PLV', labelAt: 0.6, r0: 0.18, r1: 0.08, offset: 9.0,
      pts: [[-1.2, -5.2, -1.8], [0.0, -5.3, -2.5], [1.0, -5.6, -2.9]] },
  ],
  // guide/diagnostic catheter from the right radial: innominate → ascending aorta → ostium
  catheter: {
    left: [[0.4, 0, 0.1], [0.0, 0.6, 0.0], [-0.6, 1.8, 0.0], [-0.9, 3.5, -0.2], [-0.7, 5.5, -0.5], [-2.0, 7.5, -0.4], [-4.0, 8.5, 0.0]],
    right: [[-0.35, 0, 0.25], [-0.5, 0.8, 0.0], [-0.7, 2.5, -0.2], [-0.8, 4.5, -0.4], [-1.8, 7.0, -0.4], [-4.0, 8.5, 0.0]],
  },
};

export const VIEWS = [
  { id: 'rao-cau', system: 'left', lao: -25, cra: -25, short: 'RAO caudal', name: 'RAO 25° / CAU 25°',
    shows: 'Circumflex and obtuse marginals laid out, left main bifurcation. The LAD is foreshortened here — never judge it from this view alone.' },
  { id: 'rao-cra', system: 'left', lao: -25, cra: 30, short: 'RAO cranial', name: 'RAO 25° / CRA 30°',
    shows: 'Mid and distal LAD with septals (projecting down) and diagonals (projecting up) separated.' },
  { id: 'ap-cra', system: 'left', lao: 0, cra: 35, short: 'AP cranial', name: 'AP / CRA 35°',
    shows: 'Proximal-to-mid LAD and the diagonal origins — often the cleanest single view of an LAD/diagonal bifurcation.' },
  { id: 'lao-cra', system: 'left', lao: 40, cra: 25, short: 'LAO cranial', name: 'LAO 40° / CRA 25°',
    shows: 'Opens the LAD/D1 bifurcation and shows the LAD running down the interventricular groove; the working view for this lesion.' },
  { id: 'spider', system: 'left', lao: 45, cra: -30, short: 'LAO caudal (spider)', name: 'LAO 45° / CAU 30° — “spider”',
    shows: 'Left main, its bifurcation and the ostia of the LAD and circumflex. The view for left main and ostial disease.' },
  { id: 'ap-cau', system: 'left', lao: 0, cra: -30, short: 'AP caudal', name: 'AP / CAU 30°',
    shows: 'Left main body and proximal circumflex with its marginals.' },
  { id: 'lao-r', system: 'right', lao: 35, cra: 0, short: 'LAO 35 (RCA)', name: 'LAO 35°',
    shows: 'The RCA as a “C”: proximal, mid and distal segments down to the crux.' },
  { id: 'rao-r', system: 'right', lao: -30, cra: 0, short: 'RAO 30 (RCA)', name: 'RAO 30°',
    shows: 'Mid RCA and the PDA along the inferior wall — the RCA as an “L”.' },
  { id: 'crux', system: 'right', lao: 0, cra: 25, short: 'AP cranial (crux)', name: 'AP / CRA 25°',
    shows: 'The crux: distal RCA, PDA and posterolateral branch origins pulled apart.' },
];

/* ---------- IVUS of the LAD, 60 mm pullback (0 distal → 60 left main) ---------- */

const smooth = (x, a, b) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const bump = (x, c, w) => { const d = (x - c) / w; return Math.abs(d) >= 1 ? 0 : Math.cos(d * Math.PI / 2) ** 2; };

function eem(pos) {
  const base = 1.8 + 0.25 * smooth(pos, 10, 47) + 0.25 * smooth(pos, 50, 56);
  return base + 0.12 * bump(pos, 25, 9);                  // positive remodelling at the lesion
}
function baseLumen(pos) { return 1.55 + 0.25 * smooth(pos, 10, 47) + 0.25 * smooth(pos, 50, 56); }
function calcArc(pos) {
  if (pos < 16 || pos > 38) return 0;
  if (pos < 19 || pos > 35) return 270;
  return 360;
}

/** state: 'pre' | 'prep' | 'stent' | 'opt' | 'over' */
export function ivusProfile(state) {
  return (pos) => {
    const f = { eemR: eem(pos), calc: calcArc(pos), calcStart: 0.4 };
    if (pos > 32 && pos < 35.5) f.branch = 0.65 * bump(pos, 33.7, 1.8);   // D1 ostium
    if (state === 'pre') {
      f.lumenR = baseLumen(pos) * (1 - 0.523 * bump(pos, 25, 12));
      f.ecc = 0.06; f.eccAt = 1.2;
      if (pos > 23.5 && pos < 26.5) f.note = 'MLA site: 360° superficial calcium with reverberations — the EEM is lost in the shadow.';
    } else if (state === 'prep') {
      f.lumenR = baseLumen(pos) * (1 - 0.258 * bump(pos, 25, 12));
      if (f.calc === 360 && pos > 20 && pos < 33) { f.fractures = [0.6, 2.5, 4.4]; f.note = 'Calcium fractures after lithotripsy: breaks in the arc with tissue visible through them.'; }
    } else {
      const inStent = pos >= 11 && pos <= 43;
      if (!inStent) { f.lumenR = baseLumen(pos) * (1 - 0.1 * bump(pos, 25, 12)); }
      else {
        f.stent = true;
        const dist = 1.555, prox = 1.82;
        const mid = state === 'stent' ? 1.287 : state === 'opt' ? 1.482 : 1.53;
        let r = dist + (prox - dist) * smooth(pos, 33, 40);
        r -= (dist - mid) * bump(pos, 26.5, 7.5);
        f.lumenR = r;
        if (f.calc) f.fractures = [0.6, 2.5, 4.4];
        if (state === 'stent' && pos > 24 && pos < 29) f.note = 'Minimal stent area sits in the calcified segment: the stent has not expanded fully against the ring.';
        if (state === 'over' && pos > 25 && pos < 28) f.note = 'Echolucent gap behind the struts at 26 mm — medial disruption at the site of the oversized inflation.';
      }
    }
    return f;
  };
}

export const IVUS_MARKS = {
  pre: [{ label: 'Distal reference', at: 8, ref: true }, { label: 'MLA', at: 25 }, { label: 'D1 ostium', at: 33.7 }, { label: 'Proximal reference', at: 47 }],
  post: [{ label: 'Distal reference', at: 8, ref: true }, { label: 'Distal edge', at: 11.5 }, { label: 'MSA', at: 26.5 }, { label: 'POT segment', at: 41 }],
};
