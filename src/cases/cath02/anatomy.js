/* ============================================================
   CASE 02 — ANATOMY
   A right-dominant system. The culprit of her angina is an
   eccentric, soft plaque in the mid RCA: in profile it is tight,
   en face it nearly vanishes — so the views she gets decide
   what the operator believes. The left system is near-normal.

   Coordinates as in Case 01: x = patient's left, y = cranial,
   z = anterior (≈ cm). RCA parameter t runs 0 (ostium) → 1 (crux).
   ============================================================ */

export const RCA_LESION = { t0: 0.34, t1: 0.47 };
export const STENT = { t0: 0.31, t1: 0.5 };
export const OSTIAL = { t0: 0, t1: 0.09 };

export const TREE = {
  vessels: [
    { id: 'LM', system: 'left', label: 'LM', labelAt: 0.5, r0: 0.45, r1: 0.42, offset: 0,
      pts: [[0.4, 0, 0.1], [0.9, -0.15, 0.35], [1.4, -0.3, 0.6]] },
    { id: 'LAD', system: 'left', label: 'LAD', labelAt: 0.62, r0: 0.36, r1: 0.12, offset: 1.2,
      pts: [[1.4, -0.3, 0.6], [2.0, -0.9, 1.35], [2.45, -1.75, 1.95], [2.95, -3.0, 2.4], [3.45, -4.6, 2.55], [3.85, -6.3, 2.3], [4.0, -7.5, 1.8]],
      lesions: [{ t0: 0.3, t1: 0.38, sev: 0.3 }] },
    { id: 'D1', system: 'left', label: 'D1', labelAt: 0.7, r0: 0.24, r1: 0.1, offset: 3.4,
      pts: [[2.45, -1.75, 1.95], [3.2, -2.3, 2.35], [4.0, -3.1, 2.3], [4.7, -4.1, 1.9]] },
    { id: 'S1', system: 'left', label: 'S1', labelAt: 0.6, r0: 0.14, r1: 0.06, offset: 2.8,
      pts: [[2.2, -1.35, 1.75], [2.1, -2.3, 1.0], [2.0, -3.2, 0.4]] },
    { id: 'LCx', system: 'left', label: 'LCx', labelAt: 0.45, r0: 0.3, r1: 0.13, offset: 1.2,
      pts: [[1.4, -0.3, 0.6], [2.3, -0.55, 0.05], [3.15, -1.1, -0.9], [3.6, -2.1, -1.9], [3.4, -3.1, -2.7]] },
    { id: 'OM1', system: 'left', label: 'OM1', labelAt: 0.7, r0: 0.22, r1: 0.09, offset: 2.9,
      pts: [[3.15, -1.1, -0.9], [4.1, -2.2, -0.7], [4.7, -3.6, -0.3], [4.9, -4.8, 0.1]] },

    { id: 'RCA', system: 'right', label: 'RCA', labelAt: 0.24, r0: 0.44, r1: 0.28, offset: 0,
      pts: [[-0.35, 0, 0.25], [-1.3, -0.4, 1.05], [-2.2, -1.3, 1.25], [-2.75, -2.6, 0.9], [-2.95, -3.9, 0.0], [-2.4, -4.8, -1.1], [-1.2, -5.2, -1.8]],
      // eccentric plaque bulging toward the patient's left-anterior: hidden in LAO, laid bare in RAO
      lesions: [{ ...RCA_LESION, sev: 0.82, ecc: 0.55, dir: [0.87, 0, 0.5] }] },
    { id: 'CB', system: 'right', label: 'Conus', labelAt: 0.8, r0: 0.11, r1: 0.05, offset: 0.6,
      pts: [[-0.75, -0.15, 0.6], [-0.7, 0.4, 1.4], [-0.4, 0.9, 1.9]] },
    { id: 'SAN', system: 'right', label: 'SA nodal', labelAt: 0.7, r0: 0.08, r1: 0.04, offset: 0.9,
      pts: [[-1.0, -0.25, 0.85], [-1.4, 0.6, 0.2], [-1.6, 1.4, -0.4]] },
    { id: 'RV', system: 'right', label: 'RV branch', labelAt: 0.7, r0: 0.13, r1: 0.06, offset: 4.4,
      pts: [[-2.75, -2.6, 0.9], [-2.0, -3.3, 1.9], [-1.2, -4.0, 2.3]] },
    { id: 'PDA', system: 'right', label: 'PDA', labelAt: 0.5, r0: 0.21, r1: 0.08, offset: 9.0,
      pts: [[-1.2, -5.2, -1.8], [0.0, -6.0, -1.3], [1.2, -6.9, -0.6], [2.0, -7.5, 0.0]] },
    { id: 'PLV', system: 'right', label: 'PLV', labelAt: 0.6, r0: 0.19, r1: 0.08, offset: 9.0,
      pts: [[-1.2, -5.2, -1.8], [0.0, -5.3, -2.5], [1.0, -5.6, -2.9]] },
    { id: 'AVN', system: 'right', label: 'AV nodal', labelAt: 0.9, r0: 0.07, r1: 0.04, offset: 9.2,
      pts: [[-0.9, -5.35, -1.9], [-0.6, -4.6, -2.3], [-0.4, -4.0, -2.5]] },
  ],
  catheter: {
    left: [[0.4, 0, 0.1], [0.0, 0.6, 0.0], [-0.6, 1.8, 0.0], [-0.9, 3.5, -0.2], [-0.7, 5.5, -0.5], [-2.0, 7.5, -0.4], [-4.0, 8.5, 0.0]],
    right: [[-0.35, 0, 0.25], [-0.5, 0.8, 0.0], [-0.7, 2.5, -0.2], [-0.8, 4.5, -0.4], [-1.8, 7.0, -0.4], [-4.0, 8.5, 0.0]],
  },
};

export const VIEWS = [
  { id: 'lao-r', system: 'right', lao: 35, cra: 0, short: 'LAO 35', name: 'LAO 35°',
    shows: 'The RCA as a “C”: ostium, proximal, mid and distal segments to the crux. The standard first view — and here, the one that flatters the lesion.' },
  { id: 'rao-r', system: 'right', lao: -30, cra: 0, short: 'RAO 30', name: 'RAO 30°',
    shows: 'The RCA as an “L”: the mid segment in profile and the PDA along the inferior wall. Here the eccentric plaque is laid bare.' },
  { id: 'crux', system: 'right', lao: 0, cra: 25, short: 'AP cranial (crux)', name: 'AP / CRA 25°',
    shows: 'The crux: PDA, PLV and the AV nodal branch pulled apart.' },
  { id: 'lao-cra-r', system: 'right', lao: 30, cra: 20, short: 'LAO cranial', name: 'LAO 30° / CRA 20°',
    shows: 'The distal RCA bifurcation, and the ostium seen square-on — useful when engaging and stenting it.' },
  { id: 'rao-cau', system: 'left', lao: -25, cra: -25, short: 'RAO caudal', name: 'RAO 25° / CAU 25°',
    shows: 'Left main bifurcation, circumflex and marginals.' },
  { id: 'lao-cra', system: 'left', lao: 40, cra: 25, short: 'LAO cranial', name: 'LAO 40° / CRA 25°',
    shows: 'Mid LAD and its diagonals.' },
  { id: 'spider', system: 'left', lao: 45, cra: -30, short: 'Spider', name: 'LAO 45° / CAU 30°',
    shows: 'Left main and the LAD/LCx ostia.' },
  { id: 'rao-cra', system: 'left', lao: -25, cra: 30, short: 'RAO cranial', name: 'RAO 25° / CRA 30°',
    shows: 'Mid and distal LAD with septals and diagonals separated.' },
];

/* ---------- IVUS of the RCA, 60 mm pullback (0 distal → 60 ostium) ---------- */

const smooth = (x, a, b) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const bump = (x, c, w) => { const d = (x - c) / w; return Math.abs(d) >= 1 ? 0 : Math.cos(d * Math.PI / 2) ** 2; };

const eem = pos => 1.8 + 0.2 * smooth(pos, 12, 48) + 0.1 * bump(pos, 30, 10);
const baseLumen = pos => 1.5 + 0.2 * smooth(pos, 12, 48);

/** state: 'pre' | 'stent' | 'dissect' | 'sealed' */
export function ivusProfile(state) {
  return (pos) => {
    const f = { eemR: eem(pos), calc: 0, ecc: 0.05, eccAt: 2.2 };
    if (pos > 44 && pos < 47) f.branch = 0.5 * bump(pos, 45.5, 1.5);    // RV branch
    const lesion = 1 - 0.43 * bump(pos, 30, 10);
    f.lumenR = baseLumen(pos) * lesion;
    if (state === 'pre') {
      f.ecc = 0.25; f.eccAt = 2.2;
      if (pos > 28.5 && pos < 31.5) f.note = 'MLA: soft, echolucent fibrofatty plaque, eccentric, no calcium and no attenuation. It will dilate easily.';
      return f;
    }
    const inStent = pos >= 19 && pos <= 41;
    if (inStent) {
      f.stent = true;
      f.lumenR = 1.5 + 0.18 * smooth(pos, 22, 40) - 0.02 * bump(pos, 24, 3);
      if (pos > 23 && pos < 25) f.note = 'Minimal stent area here: well expanded and apposed.';
    } else {
      f.lumenR = baseLumen(pos) * (1 - 0.08 * bump(pos, 30, 14));
    }
    if (pos > 16.2 && pos < 18.8) {
      f.flap = { at: 1.0, arc: 0.85, depth: 0.22 };
      f.note = 'Distal edge: a small flap, about 50°, 2 mm long, confined to plaque — the media is intact and flow is normal.';
    }
    if (state === 'dissect' && pos > 51) {
      f.flap = { at: 2.6, arc: 2.6, depth: 0.75 };
      f.lumenR = baseLumen(pos) * 0.66;
      f.note = 'Ostium: a long spiral flap with a crescent false lumen squeezing the true lumen. The IVUS catheter and wire are in the TRUE lumen.';
    }
    if (state === 'sealed' && pos >= 51) {
      f.stent = true; f.flap = null;
      f.lumenR = 1.85;
      if (pos > 55) f.note = 'Ostial stent: the entry tear is covered, the false lumen compressed, the struts reach 1–2 mm into the aorta.';
    }
    return f;
  };
}

export const IVUS_MARKS = {
  pre: [{ label: 'Distal reference', at: 10, ref: true }, { label: 'MLA', at: 30 }, { label: 'RV branch', at: 45.5 }, { label: 'Proximal reference', at: 49 }],
  post: [{ label: 'Distal reference', at: 10, ref: true }, { label: 'Distal edge', at: 17.5 }, { label: 'MSA', at: 24 }, { label: 'Proximal edge', at: 42 }],
  ostium: [{ label: 'Distal reference', at: 10, ref: true }, { label: 'Stented segment', at: 30 }, { label: 'Proximal RCA', at: 48 }, { label: 'Ostium', at: 57 }],
};
