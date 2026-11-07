/* ============================================================
   CATH LAB · CASE 03 — ANATOMY & VIEWS
   One coronary tree in 3D, the standard C-arm projections, and
   the segments a team must see before it can call an angiogram
   complete.

   Patient frame (the same as kit/Angio.jsx and Case 01):
   x = patient's LEFT, y = CRANIAL, z = ANTERIOR, units ≈ cm,
   origin at the left main ostium. Each vessel's parameter t
   runs 0 (origin) → 1 (end).
   ============================================================ */

// The lesions this patient brings to the table.
//  · LM ostium: eccentric plaque on the roof of the left main. Seen in profile
//    from below (caudal views); en face from above and in front it all but vanishes.
//  · LCx: the culprit, a tight mid-circumflex stenosis just after OM1.
//  · LAD: a moderate mid-LAD plaque — a bystander.
export const LESIONS = {
  LM: [{ t0: 0.0, t1: 0.45, sev: 0.64, ecc: 0.85, dir: [-0.3, 0.75, 0.6], shape: k => Math.sin(Math.min(1, k * 2.2) * Math.PI / 2) * (1 - k * 0.35) }],
  LCx: [{ t0: 0.4, t1: 0.52, sev: 0.88 }],
  LAD: [{ t0: 0.42, t1: 0.54, sev: 0.45 }],
  RCA: [{ t0: 0.36, t1: 0.44, sev: 0.3 }],
};

export const TREE = {
  vessels: [
    { id: 'LM', system: 'left', name: 'Left main', label: 'LM', labelAt: 0.5, color: '#F4F7FB', r0: 0.46, r1: 0.43, offset: 0,
      pts: [[0.4, 0, 0.1], [0.77, 0.31, 0.47], [1.14, 0.62, 0.84]] },
    { id: 'LAD', system: 'left', name: 'Left anterior descending', label: 'LAD', labelAt: 0.62, color: '#22D3EE', r0: 0.38, r1: 0.12, offset: 1.2,
      pts: [[1.14, 0.62, 0.84], [1.74, 0.02, 1.59], [2.19, -0.83, 2.19], [2.69, -2.08, 2.64], [3.19, -3.68, 2.79], [3.59, -5.38, 2.54], [3.74, -6.58, 2.04], [3.44, -7.28, 1.24]] },
    { id: 'D1', system: 'left', name: 'First diagonal', label: 'D1', labelAt: 0.7, color: '#7DD3FC', r0: 0.26, r1: 0.11, offset: 3.4,
      pts: [[2.19, -0.83, 2.19], [2.94, -1.38, 2.59], [3.74, -2.18, 2.54], [4.44, -3.18, 2.14]] },
    { id: 'D2', system: 'left', name: 'Second diagonal', label: 'D2', labelAt: 0.7, color: '#7DD3FC', r0: 0.17, r1: 0.07, offset: 5.0,
      pts: [[2.84, -2.48, 2.69], [3.64, -3.38, 2.59], [4.14, -4.28, 2.24]] },
    { id: 'S1', system: 'left', name: 'First septal', label: 'S1', labelAt: 0.75, color: '#A78BFA', r0: 0.14, r1: 0.06, offset: 2.8,
      pts: [[1.94, -0.43, 1.99], [1.84, -1.38, 1.24], [1.74, -2.28, 0.64]] },
    { id: 'S2', system: 'left', name: 'Second septal', color: '#A78BFA', r0: 0.11, r1: 0.05, offset: 4.4,
      pts: [[2.74, -2.18, 2.62], [2.54, -3.08, 1.84], [2.44, -3.78, 1.34]] },
    { id: 'LCx', system: 'left', name: 'Left circumflex', label: 'LCx', labelAt: 0.3, color: '#FBBF24', r0: 0.33, r1: 0.14, offset: 1.2,
      pts: [[1.14, 0.62, 0.84], [2.0, 0.3, 0.0], [2.75, -0.35, -1.4], [3.05, -1.35, -2.8], [2.75, -2.65, -3.8]] },
    { id: 'OM1', system: 'left', name: 'First obtuse marginal', label: 'OM1', labelAt: 0.7, color: '#FB923C', r0: 0.24, r1: 0.1, offset: 2.9,
      pts: [[2.75, -0.35, -1.4], [3.7, -1.7, -1.7], [4.2, -3.3, -1.6], [4.3, -4.7, -1.3]] },
    { id: 'OM2', system: 'left', name: 'Second obtuse marginal', label: 'OM2', labelAt: 0.75, color: '#FB923C', r0: 0.17, r1: 0.08, offset: 4.2,
      pts: [[3.05, -1.35, -2.8], [3.75, -2.8, -2.4], [3.95, -4.2, -1.8]] },

    { id: 'RCA', system: 'right', name: 'Right coronary artery', label: 'RCA', labelAt: 0.28, color: '#F472B6', r0: 0.4, r1: 0.26, offset: 0,
      pts: [[-0.35, 0, 0.25], [-1.3, -0.4, 1.05], [-2.2, -1.3, 1.25], [-2.75, -2.6, 0.9], [-2.95, -3.9, 0.0], [-2.4, -4.8, -1.1], [-1.2, -5.2, -1.8]] },
    { id: 'CB', system: 'right', name: 'Conus branch', label: 'Conus', labelAt: 0.9, color: '#C4B5FD', r0: 0.1, r1: 0.05, offset: 1.0,
      pts: [[-1.3, -0.4, 1.05], [-1.2, 0.3, 1.6], [-0.9, 0.9, 1.9]] },
    { id: 'AM', system: 'right', name: 'Acute marginal', label: 'AM', labelAt: 0.7, color: '#F9A8D4', r0: 0.15, r1: 0.06, offset: 5.0,
      pts: [[-2.85, -3.4, 0.5], [-2.2, -4.4, 1.5], [-1.3, -5.2, 2.0]] },
    { id: 'PDA', system: 'right', name: 'Posterior descending', label: 'PDA', labelAt: 0.55, color: '#FDA4AF', r0: 0.2, r1: 0.08, offset: 9.0,
      pts: [[-1.2, -5.2, -1.8], [0.0, -6.0, -1.3], [1.2, -6.9, -0.6], [2.0, -7.5, 0.0]] },
    { id: 'PLV', system: 'right', name: 'Posterolateral branch', label: 'PLV', labelAt: 0.65, color: '#FDA4AF', r0: 0.18, r1: 0.08, offset: 9.0,
      pts: [[-1.2, -5.2, -1.8], [0.0, -5.3, -2.5], [1.0, -5.6, -2.9]] },
  ],
  // diagnostic catheter from the right radial: innominate → ascending aorta → ostium
  catheter: {
    left: [[0.4, 0, 0.1], [0.0, 0.6, 0.0], [-0.6, 1.8, 0.0], [-0.9, 3.5, -0.2], [-0.7, 5.5, -0.5], [-2.0, 7.5, -0.4], [-4.0, 8.5, 0.0]],
    right: [[-0.35, 0, 0.25], [-0.5, 0.8, 0.0], [-0.7, 2.5, -0.2], [-0.8, 4.5, -0.4], [-1.8, 7.0, -0.4], [-4.0, 8.5, 0.0]],
  },
  // aorta for the 3D model: root → ascending → arch → descending
  aorta: [[-0.2, 0.2, -0.4], [-0.7, 3.5, -0.6], [-0.4, 7.2, -1.8], [0.9, 8.0, -4.2], [1.6, 5.5, -5.6], [1.7, 0, -5.8], [1.6, -9, -5.6]],
  heart: { centre: [1.5, -3.5, -0.5], apex: [3.9, -8.3, 1.4], radii: [5.8, 4.4, 4.0] },
  spine: { x: 0, z: -6.5 },
  iso: [1.4, -3.2, 0],
};

/** Segments a complete angiogram must show, each in two roughly orthogonal views. */
export const SEGMENTS = [
  { id: 'lm', vessel: 'LM', t0: 0, t1: 1, name: 'Left main', short: 'LM', best: ['spider', 'ap-cau', 'ap'] },
  { id: 'plad', vessel: 'LAD', t0: 0, t1: 0.3, name: 'Proximal LAD', short: 'pLAD', best: ['spider', 'rao-cra', 'ap-cra', 'lao-cra'] },
  { id: 'mlad', vessel: 'LAD', t0: 0.3, t1: 0.65, name: 'Mid LAD', short: 'mLAD', best: ['rao-cra', 'ap-cra', 'lao-cra'] },
  { id: 'dlad', vessel: 'LAD', t0: 0.65, t1: 1, name: 'Distal LAD', short: 'dLAD', best: ['rao-cra', 'ap-cra', 'lat'] },
  { id: 'd1', vessel: 'D1', t0: 0, t1: 0.5, name: 'First diagonal', short: 'D1', best: ['lao-cra', 'ap-cra'] },
  { id: 'plcx', vessel: 'LCx', t0: 0, t1: 0.45, name: 'Proximal circumflex', short: 'pLCx', best: ['rao-cau', 'ap-cau', 'spider'] },
  { id: 'mlcx', vessel: 'LCx', t0: 0.45, t1: 1, name: 'Mid–distal circumflex', short: 'm/dLCx', best: ['rao-cau', 'ap-cau'] },
  { id: 'om1', vessel: 'OM1', t0: 0, t1: 0.5, name: 'First obtuse marginal', short: 'OM1', best: ['rao-cau', 'ap-cau'] },
  { id: 'prca', vessel: 'RCA', t0: 0, t1: 0.33, name: 'Proximal RCA', short: 'pRCA', best: ['lao-r', 'rao-r'] },
  { id: 'mrca', vessel: 'RCA', t0: 0.33, t1: 0.66, name: 'Mid RCA', short: 'mRCA', best: ['lao-r', 'rao-r'] },
  { id: 'drca', vessel: 'RCA', t0: 0.66, t1: 1, name: 'Distal RCA', short: 'dRCA', best: ['lao-r', 'crux'] },
  { id: 'pda', vessel: 'PDA', t0: 0, t1: 0.6, name: 'Posterior descending', short: 'PDA', best: ['crux', 'rao-r'] },
];

/**
 * Standard projections. `lao` > 0 is LAO, < 0 RAO; `cra` > 0 cranial, < 0 caudal.
 * The name always describes where the DETECTOR sits.
 */
export const VIEWS = [
  { id: 'ap', system: 'left', lao: 0, cra: 0, short: 'AP', name: 'AP (straight)', emoji: '⬜',
    best: 'Left main body and ostium (with a shallow caudal tilt); a first look at the whole tree.',
    watch: 'Everything overlaps: LAD and circumflex cross, the proximal LAD is foreshortened, the spine runs straight through the middle.',
    tell: 'Spine in the centre of the image, no tilt of the diaphragm, catheter rising straight up the middle.' },
  { id: 'rao-cau', system: 'left', lao: -30, cra: -25, short: 'RAO caudal', name: 'RAO 30° · CAU 25°', emoji: '↘️',
    best: 'Circumflex and obtuse marginals laid out, LM bifurcation, proximal LAD origin.',
    watch: 'The mid–distal LAD is foreshortened and runs over the septum: never measure an LAD lesion here.',
    tell: 'Spine on the LEFT of the image; the LAD runs down toward the bottom right; circumflex hugs the lower border, marginals hang down.' },
  { id: 'rao-cra', system: 'left', lao: -30, cra: 30, short: 'RAO cranial', name: 'RAO 30° · CRA 30°', emoji: '↗️',
    best: 'Mid and distal LAD: septals point down into the septum, diagonals point up — the two families separate.',
    watch: 'The proximal LAD and LM bifurcation overlap; the circumflex is foreshortened.',
    tell: 'Spine on the left; diaphragm and liver come up into the bottom of the field; septals (straight, downward) vs diagonals (curving up and out).' },
  { id: 'ap-cra', system: 'left', lao: 0, cra: 35, short: 'AP cranial', name: 'AP · CRA 35°', emoji: '⬆️',
    best: 'Proximal-to-mid LAD and the diagonal origins — often the cleanest view of the LAD/D1 bifurcation.',
    watch: 'Circumflex foreshortened and overlapped; diaphragm can burn out the distal LAD.',
    tell: 'Spine central, the diaphragm dome pushed up into the image, the LAD runs straight down the middle-right.' },
  { id: 'lao-cra', system: 'left', lao: 45, cra: 30, short: 'LAO cranial', name: 'LAO 45° · CRA 30°', emoji: '🌂',
    best: 'LAD running down the interventricular groove, diagonals peeling off to the right, septals to the left — the bifurcation view.',
    watch: 'LM and proximal circumflex foreshortened; obtuse marginals overlap each other.',
    tell: 'Spine on the RIGHT of the image; the LAD runs down the middle of the heart shadow; the circumflex heads right and behind.' },
  { id: 'spider', system: 'left', lao: 45, cra: -30, short: 'LAO caudal (spider)', name: 'LAO 45° · CAU 30° — “spider”', emoji: '🕷️',
    best: 'Left main, its bifurcation and the ostia of the LAD and circumflex — the view for left main and ostial disease.',
    watch: 'The mid–distal LAD and marginals are foreshortened (the “spider legs”), and the end-on proximal LAD can lie over the left main — if it does, AP caudal is the second LM view.',
    tell: 'Spine on the right, looking UP at the heart from the feet: LM in the centre with the LAD and circumflex legs spreading out.' },
  { id: 'ap-cau', system: 'left', lao: 0, cra: -30, short: 'AP caudal', name: 'AP · CAU 30°', emoji: '⬇️',
    best: 'Left main body and proximal circumflex with its marginals; the LM ostium in profile.',
    watch: 'Mid LAD foreshortened; the spine overlaps the LM in some patients.',
    tell: 'Spine central, no diaphragm in the field, the circumflex sweeping right-to-left along the bottom.' },
  { id: 'lat', system: 'left', lao: 90, cra: 0, short: 'Left lateral', name: 'LAO 90° (left lateral)', emoji: '⏸️',
    best: 'Mid and distal LAD in profile, the LAD wrapping the apex; LIMA-to-LAD grafts.',
    watch: 'Higher dose and scatter (thick path through the chest); the circumflex disappears behind.',
    tell: 'Spine on the far right, the sternum on the far left; the LAD runs down the front of the heart.' },

  { id: 'lao-r', system: 'right', lao: 30, cra: 0, short: 'LAO 30 (RCA)', name: 'LAO 30°', emoji: '🌙',
    best: 'The RCA as a “C”: ostium, proximal, mid and distal segments down to the crux.',
    watch: 'PDA and posterolateral branches are foreshortened toward the viewer.',
    tell: 'Spine on the right; the RCA curves like a C around the right side of the heart shadow.' },
  { id: 'rao-r', system: 'right', lao: -30, cra: 0, short: 'RAO 30 (RCA)', name: 'RAO 30°', emoji: '🔤',
    best: 'Mid RCA and the PDA running along the inferior wall — the RCA as an “L”.',
    watch: 'The proximal RCA and the crux overlap; ostial lesions hide behind the catheter.',
    tell: 'Spine on the left; the RCA drops vertically then turns along the floor of the heart (an L).' },
  { id: 'crux', system: 'right', lao: 0, cra: 25, short: 'AP cranial (crux)', name: 'AP · CRA 25°', emoji: '✳️',
    best: 'The crux: distal RCA, PDA and posterolateral origins pulled apart.',
    watch: 'Proximal RCA foreshortened; diaphragm in the field.',
    tell: 'Spine central, diaphragm up into the image, the PDA and PLV fanning out at the bottom.' },
];

export const VIEW_BY_ID = Object.fromEntries(VIEWS.map(v => [v.id, v]));

export const viewName = (lao, cra) =>
  `${Math.round(lao) === 0 ? 'AP' : (lao > 0 ? 'LAO ' : 'RAO ') + Math.abs(Math.round(lao)) + '°'}${Math.round(cra) === 0 ? '' : ' · ' + (cra > 0 ? 'CRA ' : 'CAU ') + Math.abs(Math.round(cra)) + '°'}`;

/** The standard view nearest to the C-arm's current angles, if within `tol` degrees. */
export function nearestView(lao, cra, system, tol = 8) {
  let best = null, bd = 1e9;
  for (const v of VIEWS) {
    if (system && v.system !== system) continue;
    const d = Math.hypot(v.lao - lao, v.cra - cra);
    if (d < bd) { bd = d; best = v; }
  }
  return bd <= tol ? best : null;
}
