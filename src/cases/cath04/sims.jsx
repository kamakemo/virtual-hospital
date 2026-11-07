import React, { useEffect, useRef, useState } from 'react';
import { useCase } from '../kit/CaseKit.jsx';
import { useCanvas } from '../kit/Monitor.jsx';

/* ============================================================
   CATH LAB · CASE 04 — THE TOOLBOX: ILLUSTRATIONS & SIMULATORS
   Every device is drawn here (no image files): the room, the
   access kit, catheter curves, wire anatomy, balloons, stents,
   burrs, closure devices and support pumps — and each family
   has a simulator that teaches the one number that matters
   (French size, curve size, zero level, tip load, atm, ratio).
   ============================================================ */

const TEST = typeof window !== 'undefined' && !!window.__vhTest;

export function ScoreOnce({ id, pts, max }) {
  const { award, stageId } = useCase();
  useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
}

const INK = '#E9F2FC', INK2 = '#A9BBD2', INK3 = '#6A7F9B', CY = '#22D3EE', GO = '#F5C451', GR = '#34E39A', RD = '#FB7185', VI = '#A78BFA', OR = '#FB923C';

/* ============================================================
   1 · THE ROOM — an illustrated floor plan with hotspots
   ============================================================ */

const ROOM = [
  { id: 'carm', x: 330, y: 150, r: 34, e: '🎥', name: 'C-arm & flat-panel detector', what: 'X-ray tube under the table, detector over the chest. Rotates LAO/RAO and tilts cranial/caudal around the isocentre (the heart).', why: 'Every image is a shadow from one direction — at least two views per segment.', tip: 'Detector low, table high, collimate: the three habits that cut dose most.' },
  { id: 'table', x: 300, y: 330, r: 28, e: '🛏️', name: 'Carbon-fibre table', what: 'Radiolucent, floating top; moves head–foot and side to side under the beam.', why: 'Panning the table, not the C-arm, follows contrast along a vessel.', tip: 'Arm boards for radial access; never let the right arm drop off the board.' },
  { id: 'mon', x: 470, y: 120, r: 30, e: '🖥️', name: 'Monitor boom', what: 'Live fluoroscopy, reference (road-map) images, haemodynamics, IVUS/OCT, ECG.', why: 'Live image next to a stored reference prevents wiring the wrong branch.', tip: 'Freeze the best frame of every run as your road map.' },
  { id: 'shield', x: 230, y: 150, r: 26, e: '🛡️', name: 'Lead shields & aprons', what: 'Ceiling-suspended lead glass, table skirt, aprons, thyroid collars, lead glasses.', why: 'Scatter comes off the patient on the tube side; distance and shielding cut it by orders of magnitude.', tip: 'Shield between you and the patient, as close to the patient as possible.' },
  { id: 'inj', x: 420, y: 300, r: 26, e: '💉', name: 'Manifold, transducer & injector', what: 'Three-port manifold: pressure, contrast, flush/waste. The transducer turns pressure into a waveform; power injectors for ventriculography and aortography.', why: 'Air or clot in the manifold goes straight into a coronary artery.', tip: 'Every new connection: aspirate, then flush, with the syringe tilted up.' },
  { id: 'haemo', x: 560, y: 220, r: 30, e: '📈', name: 'Haemodynamic recording system', what: 'ECG, invasive pressures, SpO₂, the pressure-wire console, dose and contrast counters.', why: 'The pressure trace warns of a damped or wedged catheter before the injection does harm.', tip: 'Check the waveform before EVERY injection.' },
  { id: 'crash', x: 120, y: 290, r: 28, e: '⚡', name: 'Crash trolley & defibrillator', what: 'Pads on before complex PCI; airway kit; adrenaline, atropine, amiodarone; pericardiocentesis set.', why: 'VF from a coronary injection is shocked in seconds when pads are already on.', tip: 'Pads on the patient — not in the drawer — for left main, CTO, rotablation and shock.' },
  { id: 'act', x: 120, y: 190, r: 24, e: '🧪', name: 'ACT machine', what: 'Activated clotting time — checks that heparin has worked before devices go in.', why: 'An unheparinised guide grows thrombus that you then inject into the brain or the coronary.', tip: 'ACT 250–300 s (or per local device) for PCI; recheck every 30 min in long cases.' },
  { id: 'ivus', x: 560, y: 320, r: 26, e: '🔬', name: 'IVUS / OCT console', what: 'Intravascular imaging: lumen, vessel size, plaque, calcium, stent expansion.', why: 'Angiography is a shadow; imaging is a cross-section — it changes stent size in a third of cases.', tip: 'Image before and after in left main, long lesions, calcium and stent failure.' },
  { id: 'mcs', x: 470, y: 380, r: 26, e: '🫀', name: 'Mechanical support (IABP / Impella / ECMO)', what: 'Consoles parked ready for shock or high-risk PCI.', why: 'Support is placed before the crash in protected PCI — not during it.', tip: 'Know your large-bore access and closure plan before you need it.' },
  { id: 'shelf', x: 120, y: 90, r: 26, e: '🗄️', name: 'The shelves', what: 'Sheaths, wires, catheters, balloons, stents, microcatheters, snares, coils, covered stents.', why: 'In a perforation you need a covered stent and coils in seconds, not minutes.', tip: 'Know where the bail-out drawer is before you scrub.' },
];

export function LabMap() {
  const [sel, setSel] = useState(ROOM[0]);
  return (
    <div className="cs-card tight tb-map">
      <svg viewBox="0 0 680 440" role="group" aria-label="Illustrated cath lab floor plan">
        <defs>
          <linearGradient id="tbfloor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0D1C2E" /><stop offset="1" stopColor="#071120" /></linearGradient>
          <radialGradient id="tbbeam" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="rgba(253,230,138,0.35)" /><stop offset="1" stopColor="rgba(253,230,138,0)" /></radialGradient>
        </defs>
        <rect x="10" y="10" width="660" height="420" rx="22" fill="url(#tbfloor)" stroke="#1E3350" strokeWidth="2" />
        {[...Array(12)].map((_, i) => <line key={i} x1={10 + i * 55} y1="10" x2={10 + i * 55} y2="430" stroke="rgba(120,160,200,0.06)" />)}
        {/* control room window */}
        <rect x="610" y="40" width="50" height="360" rx="8" fill="rgba(34,211,238,0.06)" stroke="rgba(34,211,238,0.35)" />
        <text x="635" y="225" fill={INK3} fontSize="11" fontFamily="JetBrains Mono, monospace" transform="rotate(90 635 225)" textAnchor="middle">CONTROL ROOM · LEAD GLASS</text>
        {/* table and patient */}
        <rect x="170" y="225" width="300" height="52" rx="14" fill="#2B3442" stroke="#475569" />
        <rect x="190" y="232" width="250" height="38" rx="16" fill="rgba(242,199,165,0.35)" />
        <circle cx="180" cy="251" r="15" fill="rgba(242,199,165,0.5)" />
        <text x="320" y="255" fill={INK2} fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono, monospace">PATIENT · HEAD ←</text>
        {/* C-arm */}
        <circle cx="300" cy="251" r="70" fill="url(#tbbeam)" />
        <path d="M 250 140 A 85 85 0 0 1 380 140" fill="none" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" />
        <rect x="280" y="190" width="44" height="18" rx="4" fill="#2DD4BF" />
        {/* monitors */}
        <rect x="430" y="95" width="90" height="44" rx="6" fill="#111827" stroke="#334155" />
        <path d="M 440 120 l 10 0 l 4 -12 l 5 22 l 4 -10 l 15 0 l 4 -6 l 4 6 l 20 0" stroke={GR} fill="none" strokeWidth="2" />
        {ROOM.map(h => (
          <g key={h.id} className={'tb-hot' + (sel.id === h.id ? ' on' : '')} onClick={() => setSel(h)} role="button" tabIndex={0} aria-label={h.name}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSel(h)}>
            <circle cx={h.x} cy={h.y} r={h.r} />
            <text x={h.x} y={h.y + 8} textAnchor="middle" fontSize="22">{h.e}</text>
          </g>
        ))}
      </svg>
      <div className="tb-info">
        <h4>{sel.e} {sel.name}</h4>
        <p><b>What it is:</b> {sel.what}</p>
        <p><b>🧠 Why it matters:</b> {sel.why}</p>
        <p><b>💡 Habit:</b> {sel.tip}</p>
        <p className="cs-pts">Tap any station on the plan.</p>
      </div>
    </div>
  );
}

/* ============================================================
   2 · ACCESS — needles, sheaths and the French sizer
   ============================================================ */

/** Caption grid under an illustration: wraps cleanly at any width. */
function Captions({ items }) {
  return (
    <div className="tb-caps">
      {items.map(([h, t, c]) => <div key={h} className="tb-cap" style={c ? { borderColor: c } : undefined}><b style={c ? { color: c } : undefined}>{h}</b><span>{t}</span></div>)}
    </div>
  );
}

export function AccessKit() {
  return (
    <div className="cs-card tight">
      <svg viewBox="0 0 720 250" className="tb-illus" role="img" aria-label="Access kit: needles, sheath with dilator, J-wire">
        <text x="20" y="28" className="tb-h">🩸 The access kit (lengths shortened)</text>
        <rect x="40" y="52" width="70" height="20" rx="4" fill="#38BDF8" /><rect x="110" y="59" width="200" height="6" fill="#CBD5E1" />
        <path d="M310 59 L322 62 L310 65 Z" fill="#CBD5E1" /><text x="330" y="66" className="tb-t" fill="#38BDF8">① 21 G</text>
        <rect x="40" y="90" width="80" height="26" rx="4" fill="#F472B6" /><rect x="120" y="99" width="210" height="9" fill="#CBD5E1" />
        <path d="M330 99 L346 103.5 L330 108 Z" fill="#CBD5E1" /><text x="354" y="108" className="tb-t" fill="#F472B6">② 18 G</text>
        <rect x="40" y="140" width="56" height="34" rx="8" fill="#334155" stroke="#64748B" />
        <circle cx="68" cy="157" r="9" fill="#0F172A" stroke="#94A3B8" />
        <path d="M60 174 q -8 30 -30 40" stroke="#94A3B8" strokeWidth="5" fill="none" /><circle cx="28" cy="216" r="8" fill="#F5C451" />
        <rect x="96" y="150" width="330" height="14" rx="5" fill="#A78BFA" opacity="0.85" />
        <rect x="96" y="153.5" width="420" height="7" rx="3" fill="#E2E8F0" />
        <path d="M516 153.5 L540 157 L516 160.5 Z" fill="#E2E8F0" /><text x="550" y="162" className="tb-t" fill="#A78BFA">③ sheath + dilator</text>
        <path d="M40 232 L520 232 q 20 0 22 -10 q 2 -10 -10 -10 q -10 2 -6 12" stroke="#E2E8F0" strokeWidth="2.4" fill="none" />
        <text x="550" y="236" className="tb-t">④ J-wire</text>
      </svg>
      <Captions items={[
        ['① 21 G micropuncture needle', '0.8 mm; takes a 0.018" wire — a smaller hole if you hit the wrong spot.', '#38BDF8'],
        ['② 18 G needle', '1.3 mm; takes a 0.035" wire directly.', '#F472B6'],
        ['③ Sheath + dilator', 'Haemostatic valve, side-arm with a 3-way tap; the tapered dilator eases it in. Its French size = the largest catheter it ACCEPTS — the outer wall is bigger.', '#A78BFA'],
        ['④ 0.035" J-tipped wire', 'The “J” curls away from the vessel wall and small branches as it advances.', '#E2E8F0'],
      ]} />
    </div>
  );
}

const SHEATHS = [
  { id: '4', fr: 4, od: 1.73, label: '4 Fr (diagnostic only)' },
  { id: '5', fr: 5, od: 2.29, label: '5 Fr' },
  { id: '6s', fr: 6, od: 2.46, label: '6 Fr Slender (thin-walled)' },
  { id: '6', fr: 6, od: 2.62, label: '6 Fr standard' },
  { id: '7', fr: 7, od: 2.95, label: '7 Fr' },
  { id: '8', fr: 8, od: 3.3, label: '8 Fr' },
];

/** Sheath outer diameter vs the radial artery measured by ultrasound. */
export function FrenchSizer({ id, artery = 2.3, need = 7, onPick }) {
  const { answers, answer } = useCase();
  const pick = answers[id];
  const [hover, setHover] = useState(SHEATHS[3]);
  const s = pick ? SHEATHS.find(x => x.id === pick) : hover;
  const ratio = s.od / artery;
  const ok = s.fr >= need;
  const best = SHEATHS.find(x => x.fr >= need && x.od / artery <= 1.15) || SHEATHS.find(x => x.fr >= need);
  const pts = pick ? (pick === best.id ? 10 : s.fr >= need ? 5 : 0) : null;
  const ref = useRef(null);
  useCanvas(ref, 210, (g, w, h) => {
    g.fillStyle = '#050B16'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2 + 4, k = Math.min(w, h) / 9;
    // artery wall
    g.fillStyle = 'rgba(244,63,94,0.25)'; g.beginPath(); g.arc(cx, cy, artery / 2 * k + 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7F1D1D'; g.beginPath(); g.arc(cx, cy, artery / 2 * k, 0, Math.PI * 2); g.fill();
    // sheath cross-section
    const over = ratio > 1;
    g.fillStyle = over ? 'rgba(251,113,133,0.85)' : 'rgba(167,139,250,0.9)'; g.beginPath(); g.arc(cx, cy, s.od / 2 * k, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0F172A'; g.beginPath(); g.arc(cx, cy, s.fr / 3 / 2 * k, 0, Math.PI * 2); g.fill();
    g.font = '700 12px "JetBrains Mono", monospace'; g.fillStyle = INK; g.textAlign = 'center';
    g.fillText(`artery ${artery.toFixed(1)} mm · sheath OD ${s.od.toFixed(2)} mm · ratio ${ratio.toFixed(2)}`, cx, 18);
    g.fillStyle = over ? RD : GR; g.fillText(over ? 'sheath bigger than the artery → spasm & occlusion risk' : 'fits inside the artery', cx, h - 10);
  }, [s.id, artery]);
  return (
    <div className="cs-card tight">
      <p className="cs-q">📐 Radial artery on ultrasound: <b>{artery} mm</b>. The plan needs a <b>{need} Fr</b> guide. Which sheath?</p>
      <canvas ref={ref} className="cs-canvas" style={{ height: 210 }} aria-label="Sheath inside the radial artery, cross-section" />
      <div className="cs-row" style={{ marginTop: 8 }}>
        {SHEATHS.map(x => (
          <button key={x.id} className={'cs-chip' + ((pick || hover.id) === x.id ? ' on' : '')} disabled={!!pick}
            onMouseEnter={() => !pick && setHover(x)} onFocus={() => !pick && setHover(x)}
            onClick={() => { answer(id, x.id); onPick?.(x); }}>{x.label}</button>
        ))}
      </div>
      {TEST && <span hidden data-sheath={best.label} />}
      {pick && <p className="tb-fb">{pick === best.id ? '✅' : ok ? '🟡' : '❌'} {s.label}: OD {s.od} mm, ratio {ratio.toFixed(2)}. {!ok ? `Too small for a ${need} Fr guide.` : pick === best.id ? 'Smallest outer diameter that still takes the guide — thin-walled sheaths exist for exactly this.' : `Works, but ${best.label} takes the same guide with a smaller outer wall.`} → +{pts}/10</p>}
      <ScoreOnce id={id} pts={pts} max={10} />
    </div>
  );
}

/* ============================================================
   3 · CATHETERS — the curve gallery and engagement
   ============================================================ */

// curves as SVG paths in a 140×200 box, tip at the end of the path
export const CURVES = [
  { id: 'jl', name: 'Judkins Left (JL 3.5 / 4 / 5)', fam: 'Diagnostic & guide', use: 'Left main from the femoral route; the number is the length (cm) of the secondary curve — match it to the aortic root width.', d: 'M70 195 L70 90 C70 40 120 30 125 60 C128 80 108 92 96 86', col: CY },
  { id: 'jr', name: 'Judkins Right (JR 4)', fam: 'Diagnostic & guide', use: 'The RCA: advance to the right sinus, then rotate clockwise so the tip drops into the ostium.', d: 'M70 195 L70 70 C70 40 85 30 100 38 L112 48', col: '#F472B6' },
  { id: 'al', name: 'Amplatz Left (AL 1 / 2)', fam: 'Guide (and diagnostic)', use: 'Strong support for difficult RCA or LCx origins and dilated roots — the secondary curve sits on the non-coronary cusp. Easy to deep-seat: dissection risk.', d: 'M70 195 L70 100 C70 40 140 40 128 85 C120 110 100 100 104 88', col: OR },
  { id: 'ebu', name: 'Extra Back-Up (EBU / XB / Voda)', fam: 'Guide', use: 'The workhorse for LAD and LCx PCI: a long straight segment leans on the opposite aortic wall for passive support.', d: 'M70 195 L70 120 C70 70 80 40 110 36 C126 34 128 50 118 58 L104 70', col: GR },
  { id: 'ar', name: 'Amplatz Right (AR)', fam: 'Guide', use: 'Upward- or anteriorly-oriented RCA origins and some vein grafts.', d: 'M70 195 L70 90 C70 55 95 45 108 58 C116 66 112 78 120 80', col: VI },
  { id: 'im', name: 'Internal Mammary (IMA)', fam: 'Diagnostic & guide', use: 'LIMA/RIMA grafts from the subclavian: a sharp, short primary curve.', d: 'M70 195 L70 60 C70 40 80 36 96 40', col: GO },
  { id: 'mpa', name: 'Multipurpose (MPA)', fam: 'Diagnostic', use: 'Vein grafts, right heart, ventriculography from the arm; a gentle single curve.', d: 'M70 195 L70 70 C70 45 82 32 100 30', col: '#94A3B8' },
  { id: 'pig', name: 'Pigtail', fam: 'Diagnostic', use: 'LV gram and aortogram with a power injector: the coil and side holes spread the jet so it cannot whip into the wall.', d: 'M70 195 L70 70 C70 40 90 30 100 40 C110 52 96 66 84 58 C74 50 82 38 92 44', col: '#E2E8F0' },
  { id: 'tig', name: 'Tiger / Optitorque (radial)', fam: 'Diagnostic', use: 'One catheter for both coronaries from the right radial: rotate one way for the left, the other for the right.', d: 'M70 195 L70 90 C70 50 104 42 112 62 C116 72 108 78 100 74', col: '#5EEAD4' },
  { id: 'ikari', name: 'Ikari Left (IL)', fam: 'Guide (radial)', use: 'Designed for the radial route: backup for left and right from one shape.', d: 'M70 195 L70 105 C70 55 120 50 120 75 C120 92 104 92 100 84', col: '#C4B5FD' },
  { id: '3drc', name: '3DRC / Williams', fam: 'Diagnostic & guide', use: 'Horizontal or superior RCA origins: a three-dimensional curve that points the tip forward.', d: 'M70 195 L70 80 C70 50 92 40 104 52 C110 58 104 66 116 64', col: '#FDA4AF' },
  { id: 'gx', name: 'Guide extension (GuideLiner, Telescope)', fam: 'Accessory', use: 'A rapid-exchange “mother-in-child” tube pushed out of the guide deep into the artery for support and delivery.', d: 'M70 195 L70 60 M70 60 L70 20', col: '#FBBF24' },
];

export function CatheterGallery() {
  const [sel, setSel] = useState(CURVES[0]);
  return (
    <div className="cs-card tight">
      <div className="tb-gallery">
        {CURVES.map(c => (
          <button key={c.id} className={'tb-cat' + (sel.id === c.id ? ' on' : '')} onClick={() => setSel(c)} aria-label={c.name}>
            <svg viewBox="40 10 110 195"><path d={c.d} fill="none" stroke={c.col} strokeWidth="6" strokeLinecap="round" /><circle cx="70" cy="195" r="4" fill={c.col} /></svg>
            <span>{c.name.split(' (')[0]}</span>
          </button>
        ))}
      </div>
      <div className="tb-info" style={{ marginTop: 8 }}>
        <h4>{sel.name} <small className="cs-pts">· {sel.fam}</small></h4>
        <p>{sel.use}</p>
      </div>
      <svg viewBox="0 0 720 130" className="tb-illus" role="img" aria-label="Diagnostic versus guide catheter wall cross-sections">
        <text x="20" y="22" className="tb-h">🔍 Diagnostic vs guide — cross-section</text>
        {[['Diagnostic 6 Fr', 120, 0.045], ['Guide 6 Fr', 360, 0.07], ['Guide 7 Fr', 590, 0.081]].map(([n, x, id]) => (
          <g key={n}>
            <circle cx={x} cy="76" r="38" fill="#334155" stroke="#94A3B8" />
            {n.includes('Guide') && [...Array(16)].map((_, i) => <circle key={i} cx={x + 33 * Math.cos(i / 16 * 6.283)} cy={76 + 33 * Math.sin(i / 16 * 6.283)} r={2.2} fill="#CBD5E1" />)}
            <circle cx={x} cy="76" r={id / 0.081 * 30} fill="#0B1220" />
            <text x={x} y="126" textAnchor="middle" className="tb-t">{n}</text>
          </g>
        ))}
      </svg>
      <Captions items={[
        ['Diagnostic 6 Fr', 'Thick wall, small lumen (~0.045–0.056"): torque and shape memory for engagement and pictures.', '#94A3B8'],
        ['Guide 6 Fr', 'Thin braided wall, big lumen (~0.070"): delivers balloons, stents, a 1.5 mm burr.', CY],
        ['Guide 7 Fr', '~0.081": a 1.75 mm burr, two balloons side by side, some imaging + balloon combinations.', GO],
      ]} />
    </div>
  );
}

const ROOTS = [
  { id: 'small', label: 'Small root (young woman)', w: 3.0, best: 'jl35' },
  { id: 'normal', label: 'Normal root', w: 3.5, best: 'jl4' },
  { id: 'big', label: 'Dilated root (old, hypertensive, AS)', w: 4.5, best: 'jl5' },
];
const JL = [{ id: 'jl35', n: 'JL 3.5', len: 3.5 }, { id: 'jl4', n: 'JL 4', len: 4.0 }, { id: 'jl5', n: 'JL 5', len: 5.0 }];

/** Match the Judkins left secondary curve to the aortic root: the tip lands in, above or below the left main. */
export function EngageSim({ id }) {
  const { answers, answer } = useCase();
  const res = answers[id] || {};
  const [root, setRoot] = useState(ROOTS[0]);
  const [cat, setCat] = useState(JL[1]);
  const fit = cat.len - root.w - 0.5;    // the right curve is ~0.5 cm longer than the root is wide; + → tip flips up, − → falls into the cusp
  const ref = useRef(null);
  useCanvas(ref, 260, (g, w, h, t) => {
    g.fillStyle = '#050B16'; g.fillRect(0, 0, w, h);
    const cx = w / 2, base = h - 20, k = 34;
    const half = root.w / 2 * k;
    // aortic root: two walls, sinuses at the bottom
    g.strokeStyle = 'rgba(252,165,165,0.6)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx - half, 10); g.lineTo(cx - half, base - 40); g.quadraticCurveTo(cx - half - 10, base, cx, base); g.quadraticCurveTo(cx + half + 10, base, cx + half, base - 40); g.lineTo(cx + half, 10); g.stroke();
    // left main ostium on the left (screen right) wall
    const oy = base - 62;
    g.fillStyle = '#F87171'; g.fillRect(cx + half, oy - 8, 44, 16);
    g.fillStyle = INK2; g.font = '600 11px "JetBrains Mono", monospace'; g.fillText('LM ostium', cx + half + 4, oy - 12);
    // the catheter: shaft down the right wall, secondary curve across the root, tip toward the ostium
    const wob = Math.sin(t * 3) * 1.2;
    const tipY = oy - fit * 26 + wob;
    g.strokeStyle = CY; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - half + 8, 10); g.lineTo(cx - half + 8, oy - 40 - Math.max(0, fit) * 20);
    g.quadraticCurveTo(cx - half + 8, oy + 18, cx + half - 22, tipY + 6); g.lineTo(cx + half - 2, tipY); g.stroke();
    const good = Math.abs(fit) < 0.26;
    g.font = '700 13px "JetBrains Mono", monospace'; g.textAlign = 'center';
    g.fillStyle = good ? GR : RD;
    g.fillText(good ? '✓ coaxial with the left main' : fit > 0 ? '✗ curve too long: tip points UP / above the ostium' : '✗ curve too short: tip falls BELOW, into the cusp', cx, h - 4);
    g.textAlign = 'left';
  }, [root.id, cat.id]);
  const done = ROOTS.filter(r => res[r.id]).length;
  const got = ROOTS.filter(r => res[r.id] === r.best).length;
  return (
    <div className="cs-card tight">
      <p className="cs-q">🎯 Judkins left: the secondary curve must span the aortic root. Pick the curve for each root and press <b>Engage</b>.</p>
      <canvas ref={ref} className="cs-canvas" style={{ height: 260 }} aria-label="Judkins catheter in the aortic root" />
      <div className="cs-row" style={{ marginTop: 8 }}>
        {ROOTS.map(r => <button key={r.id} className={'cs-chip' + (root.id === r.id ? ' on' : '')} onClick={() => setRoot(r)}>{res[r.id] ? (res[r.id] === r.best ? '✅ ' : '❌ ') : ''}{r.label} · {r.w} cm</button>)}
      </div>
      <div className="cs-row" style={{ marginTop: 6 }}>
        {JL.map(c => <button key={c.id} className={'cs-chip' + (cat.id === c.id ? ' on' : '')} onClick={() => setCat(c)}>{c.n}</button>)}
        <button className="cs-btn primary" disabled={!!res[root.id]} onClick={() => answer(id, { ...res, [root.id]: cat.id })}>🔗 Engage</button>
      </div>
      {TEST && <span hidden data-engage={JSON.stringify(ROOTS.map(r => [r.label, JL.find(c => c.id === r.best).n]))} />}
      {done > 0 && <p className="tb-fb">{got}/{done} engaged coaxially{done === 3 ? ` → +${got * 4}/12` : ''}. Rule of thumb: JL 4 for most adults, 3.5 for small roots and from the right radial, 5 for dilated roots.</p>}
      <ScoreOnce id={id} pts={done === 3 ? got * 4 : null} max={12} />
    </div>
  );
}

/* ============================================================
   4 · HAEMODYNAMICS — zeroing, levelling, damping
   ============================================================ */

export function TransducerSim({ id }) {
  const { answers, answer } = useCase();
  const [height, setHeight] = useState(-10);   // cm, transducer relative to the phlebostatic axis (− = below)
  const [damp, setDamp] = useState('air');      // air | ok | ring
  const [flushAt, setFlushAt] = useState(-9);
  const res = answers[id];
  const offset = -height * 0.74;                // transducer below the heart reads high
  const ref = useRef(null);
  useCanvas(ref, 220, (g, w, h, t) => {
    g.fillStyle = '#050B16'; g.fillRect(0, 0, w, h);
    const y = mm => h - 24 - mm / 200 * (h - 44);
    g.strokeStyle = 'rgba(148,180,214,0.12)';
    for (let m = 0; m <= 200; m += 40) { g.beginPath(); g.moveTo(40, y(m)); g.lineTo(w, y(m)); g.stroke(); g.fillStyle = INK3; g.font = '10px "JetBrains Mono"'; g.fillText(m, 8, y(m) + 3); }
    g.strokeStyle = RD; g.lineWidth = 2; g.beginPath();
    const since = t - flushAt;
    let shownSys = 0, shownDia = 999;
    for (let x = 40; x < w; x++) {
      const tt = t - (w - x) / 120;
      const ph = (tt * 1.2) % 1;
      // true arterial waveform 120/70
      let p = 70 + 50 * (ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI / 2) : ph < 0.35 ? 1 - (ph - 0.12) * 1.3 + (ph > 0.3 ? 0.08 : 0) : 0.62 * Math.exp(-(ph - 0.35) * 3));
      // damping: overdamped blunts, underdamped rings
      if (damp === 'air') p = 95 + (p - 95) * 0.55;
      if (damp === 'ring') p += ph < 0.25 ? 18 * Math.sin(ph * 60) * Math.exp(-ph * 12) * 1.4 : 0;
      p += offset;
      const fs = tt - flushAt;
      if (fs > 0 && fs < 0.7) p = fs < 0.35 ? 300 : p + (damp === 'air' ? 0 : damp === 'ring' ? 60 * Math.sin((fs - 0.35) * 70) * Math.exp(-(fs - 0.35) * 18) : 40 * Math.sin((fs - 0.35) * 45) * Math.exp(-(fs - 0.35) * 30));
      shownSys = Math.max(shownSys, p); shownDia = Math.min(shownDia, p);
      x === 40 ? g.moveTo(x, y(Math.min(200, p))) : g.lineTo(x, y(Math.min(200, p)));
    }
    g.stroke();
    const s = Math.round(120 * (damp === 'air' ? 0.8 : damp === 'ring' ? 1.13 : 1) + offset + (damp === 'air' ? 19 : 0)), d = Math.round(70 + (damp === 'air' ? 11 : damp === 'ring' ? -4 : 0) + offset);
    g.fillStyle = INK; g.font = '700 22px "JetBrains Mono"'; g.textAlign = 'right';
    g.fillText(`${s}/${d}`, w - 12, 30); g.font = '11px "JetBrains Mono"'; g.fillStyle = INK3; g.fillText('true pressure 120/70', w - 12, 46); g.textAlign = 'left';
    if (since > 0 && since < 3) { g.fillStyle = GO; g.fillText('fast flush → square wave: count the oscillations', 46, 18); }
  }, [height, damp, flushAt]);
  const lock = () => answer(id, { height, damp });
  const pts = res ? (Math.abs(res.height) <= 1 ? 6 : 0) + (res.damp === 'ok' ? 6 : 0) : null;
  return (
    <div className="cs-card tight">
      <p className="cs-q">📈 The arterial trace reads oddly. Level the transducer to the heart and fix the damping until the trace is true (120/70), then lock it in.</p>
      <canvas ref={ref} className="cs-canvas" style={{ height: 220 }} aria-label="Arterial pressure trace" />
      <label className="tb-slider"><span>Transducer height vs phlebostatic axis</span>
        <input type="range" min="-20" max="20" value={height} onChange={e => setHeight(+e.target.value)} aria-label="Transducer height" />
        <b>{height > 0 ? '+' : ''}{height} cm ({offset >= 0 ? '+' : ''}{offset.toFixed(0)} mmHg)</b></label>
      <div className="cs-row">
        <button className="cs-btn" onClick={() => setFlushAt(performance.now() / 1000)}>💧 Fast-flush test</button>
        <button className={'cs-chip' + (damp === 'air' ? ' on' : '')} onClick={() => setDamp('air')}>🫧 As found</button>
        <button className={'cs-chip' + (damp === 'ok' ? ' on' : '')} onClick={() => setDamp('ok')}>🧹 Flush out the bubble, tighten the connections</button>
        <button className={'cs-chip' + (damp === 'ring' ? ' on' : '')} onClick={() => setDamp('ring')}>➰ Add extra-long tubing</button>
        <button className="cs-btn primary" onClick={lock} disabled={!!res}>🔒 Trace is true</button>
      </div>
      {res && <p className="tb-fb">{Math.abs(res.height) <= 1 ? '✅ Levelled at the phlebostatic axis (4th intercostal space, mid-axillary line).' : `❌ ${Math.abs(res.height)} cm off: every cm is ~0.74 mmHg — a transducer below the heart over-reads.`} {res.damp === 'ok' ? '✅ Optimal damping: 1.5–2 oscillations after the flush.' : res.damp === 'air' ? '❌ Still over-damped (air/clot/kink): systolic under-reads, the trace looks blunt and ‘damped’.' : '❌ Under-damped (long tubing, resonance): systolic overshoots.'} → +{pts}/12</p>}
      <ScoreOnce id={id} pts={pts} max={12} />
    </div>
  );
}

/* ============================================================
   5 · WIRES — anatomy and the wire bench
   ============================================================ */

export function WireAnatomy() {
  return (
    <div className="cs-card tight">
      <svg viewBox="0 0 760 200" className="tb-illus" role="img" aria-label="Anatomy of a coronary guidewire">
        <text x="20" y="26" className="tb-h">🧵 Inside a 0.014" coronary wire</text>
        <path d="M30 90 L360 90 L560 96 L700 98.5" stroke="#94A3B8" strokeWidth="10" fill="none" />
        <path d="M30 90 L360 90 L560 96 L700 98.5" stroke="#CBD5E1" strokeWidth="5" fill="none" />
        {[...Array(46)].map((_, i) => <ellipse key={i} cx={560 + i * 3.1} cy="98" rx="1.6" ry="7" fill="none" stroke={GO} strokeWidth="1.2" />)}
        <circle cx="706" cy="98.5" r="5" fill={GO} />
        <text x="120" y="70" className="tb-t">① core</text><text x="420" y="72" className="tb-t">② taper</text><text x="600" y="72" className="tb-t" fill={GO}>③ coil tip</text>
        <rect x="500" y="146" width="200" height="16" rx="8" fill="rgba(34,211,238,0.35)" stroke={CY} />
        <path d="M500 154 L696 154" stroke="#CBD5E1" strokeWidth="3" />
        <text x="380" y="158" className="tb-t" fill={CY}>④ polymer jacket</text>
      </svg>
      <Captions items={[
        ['① Core', 'Stainless steel or nitinol: pushability, torque and the support that devices ride on.', '#CBD5E1'],
        ['② Taper', 'The core narrows toward the tip — the longer the taper, the softer and more trackable.', '#94A3B8'],
        ['③ Coil tip', 'Radiopaque spring (~3 cm) you can see and shape. Core-to-tip designs (CTO) transmit torque precisely; shaping-ribbon designs are softer.', GO],
        ['④ Polymer jacket', 'Fielder, Pilot, Whisper: slides through microchannels and tortuosity — and perforates small branches more easily.', CY],
        ['Coating', 'Hydrophilic = slippery when wet, less feel. Hydrophobic (silicone/PTFE) = more friction, more feel.'],
        ['Tip load', 'Grams of force to bend the tip: 0.5–1 g workhorse · 1.7–4.5 g Gaia · 9–12 g Confianza Pro.', GO],
        ['Length', '180–190 cm working · 300 cm exchange or over-the-wire systems.'],
      ]} />
    </div>
  );
}

export const WIRES = [
  { id: 'bmw', name: 'Workhorse (BMW / Runthrough / Sion)', load: '~0.7–1 g', cls: 'coil, hydrophilic-coated', d: 0.014 },
  { id: 'fielder', name: 'Polymer-jacketed soft (Fielder XT / Sion Black)', load: '~0.8 g', cls: 'polymer jacket, tapered tip', d: 0.014 },
  { id: 'gaia', name: 'Composite-core CTO (Gaia 2nd)', load: '~3.5 g', cls: 'core-to-tip, tapered 0.011" tip', d: 0.014 },
  { id: 'conf', name: 'Stiff penetration (Confianza Pro 12)', load: '~12 g', cls: 'tapered 0.009" tip', d: 0.014 },
  { id: 'grand', name: 'Extra support (Grand Slam / Mailman)', load: '~1 g tip, stiff body', cls: 'heavy shaft support', d: 0.014 },
  { id: 'rota', name: 'RotaWire Floppy', load: 'soft', cls: '0.009" — the only wire a burr runs on', d: 0.009 },
  { id: 'j035', name: '0.035" J-wire, 150 cm', load: '—', cls: 'access and catheter exchange', d: 0.035 },
  { id: 'safari', name: 'Pre-shaped LV wire (Safari / Confida)', load: '—', cls: '0.035" stiff with a pigtail-like tip for TAVI', d: 0.035 },
];
const SCEN = [
  { id: 'w1', t: 'A straight, mildly diseased mid-LAD lesion — first wire across.', best: 'bmw', ok: ['grand'], why: 'A soft workhorse tip is least likely to dissect or perforate; most lesions need nothing more.' },
  { id: 'w2', t: 'A tortuous, calcified RCA: the stent will not follow the workhorse wire around the bends.', best: 'grand', ok: ['bmw'], why: 'A stiffer shaft straightens the bends (and a buddy wire or guide extension adds more support).' },
  { id: 'w3', t: 'A CTO with a tapered stump and visible microchannels.', best: 'fielder', ok: ['gaia'], why: 'A tapered, polymer-jacketed tip surfs the microchannel — escalate only if it fails.' },
  { id: 'w4', t: 'The same CTO, but the proximal cap is blunt and calcified; soft wires buckle.', best: 'gaia', ok: ['conf'], why: 'Composite-core wires with intermediate tip loads penetrate and still steer; Confianza is the escalation.' },
  { id: 'w5', t: 'Rotational atherectomy of the calcified LAD is about to start.', best: 'rota', ok: [], why: 'The burr only runs on its own 0.009" RotaWire — exchange via a microcatheter.' },
  { id: 'w6', t: 'TAVI: the valve delivery system needs a rail in the left ventricle.', best: 'safari', ok: ['j035'], why: 'A pre-shaped stiff 0.035" wire anchors in the apex without perforating it.' },
];

/** The wire bench: pick the wire for each scenario; the tip animation shows how it behaves. */
export function WireBench({ id }) {
  const { answers, answer } = useCase();
  const res = answers[id] || {};
  const [cur, setCur] = useState(SCEN[0]);
  const [wire, setWire] = useState(WIRES[0]);
  const ref = useRef(null);
  useCanvas(ref, 200, (g, w, h, t) => {
    g.fillStyle = '#050B16'; g.fillRect(0, 0, w, h);
    // a vessel, tortuous for w2, an occlusion for w3/w4
    const path = x => h / 2 + (cur.id === 'w2' ? 40 * Math.sin(x / 55) : 8 * Math.sin(x / 90));
    g.strokeStyle = 'rgba(220,38,38,0.4)'; g.lineWidth = 34; g.lineCap = 'round';
    g.beginPath(); for (let x = 20; x < w - 20; x += 4) x === 20 ? g.moveTo(x, path(x)) : g.lineTo(x, path(x)); g.stroke();
    const capX = w * 0.55;
    if (cur.id === 'w3' || cur.id === 'w4') {
      g.fillStyle = cur.id === 'w4' ? '#E5E7EB' : '#9CA3AF'; g.fillRect(capX, path(capX) - 17, 70, 34);
      if (cur.id === 'w3') { g.strokeStyle = '#1F2937'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(capX, path(capX)); g.bezierCurveTo(capX + 20, path(capX) - 6, capX + 40, path(capX) + 6, capX + 70, path(capX)); g.stroke(); }
    }
    // the wire advancing; what happens depends on the match
    const right = wire.id === cur.best, okish = cur.ok.includes(wire.id);
    const prog = ((t * 0.25) % 1);
    let stop = w - 40;
    if ((cur.id === 'w3' || cur.id === 'w4') && !right && !okish) stop = capX - 4;
    if (cur.id === 'w2' && !right && !okish) stop = w * 0.62;
    const tipX = 30 + (stop - 30) * Math.min(1, prog * 1.3);
    g.strokeStyle = '#E2E8F0'; g.lineWidth = 2.2;
    g.beginPath(); for (let x = 20; x <= tipX; x += 3) x === 20 ? g.moveTo(x, path(x)) : g.lineTo(x, path(x)); g.stroke();
    const buckled = tipX >= stop - 2 && stop < w - 40;
    g.strokeStyle = buckled ? RD : GO; g.lineWidth = 3;
    g.beginPath(); g.moveTo(tipX - 12, path(tipX - 12)); g.lineTo(tipX, path(tipX) + (buckled ? 10 * Math.sin(t * 9) : 0)); g.stroke();
    g.font = '700 12px "JetBrains Mono"'; g.fillStyle = buckled ? RD : right ? GR : GO; g.textAlign = 'center';
    g.fillText(buckled ? (cur.id === 'w2' ? 'the device will not follow — the wire lacks support' : 'tip buckles against the cap') : right ? 'crosses — right tool for the job' : okish ? 'crosses, but not the first choice' : 'not this job’s wire', w / 2, h - 10);
    g.textAlign = 'left';
  }, [cur.id, wire.id]);
  const done = SCEN.filter(s => res[s.id]).length;
  const pts = done === SCEN.length ? SCEN.reduce((n, s) => n + (res[s.id] === s.best ? 3 : s.ok.includes(res[s.id]) ? 1 : 0), 0) : null;
  return (
    <div className="cs-card tight">
      <p className="cs-q">🧵 The wire bench — for each job, try wires on the bench, then commit.</p>
      <div className="cs-row">{SCEN.map((s, i) => <button key={s.id} className={'cs-chip' + (cur.id === s.id ? ' on' : '')} onClick={() => setCur(s)}>{res[s.id] ? (res[s.id] === s.best ? '✅' : '🟡') : '⬜'} Job {i + 1}</button>)}</div>
      <p className="cs-p" style={{ margin: '8px 0' }}><b>{cur.t}</b></p>
      <canvas ref={ref} className="cs-canvas" style={{ height: 200 }} aria-label="Guidewire advancing in a vessel" />
      <div className="tb-wires">
        {WIRES.map(x => (
          <button key={x.id} className={'tb-wire' + (wire.id === x.id ? ' on' : '')} onClick={() => setWire(x)}>
            <b>{x.name}</b><span>{x.d}" · tip {x.load} · {x.cls}</span>
          </button>
        ))}
      </div>
      <div className="cs-row" style={{ marginTop: 8 }}>
        <button className="cs-btn primary" disabled={!!res[cur.id]} onClick={() => answer(id, { ...res, [cur.id]: wire.id })}>✅ Use {wire.name.split(' (')[0]} for this job</button>
        {res[cur.id] && <span className="tb-fb">{res[cur.id] === cur.best ? '✅' : '🟡'} {cur.why}</span>}
      </div>
      {TEST && <span hidden data-wires={JSON.stringify(SCEN.map(s => WIRES.find(x => x.id === s.best).name))} />}
      {pts != null && <p className="tb-fb">All six jobs done → +{pts}/18</p>}
      <ScoreOnce id={id} pts={pts} max={18} />
    </div>
  );
}

/* ============================================================
   6 · BALLOONS — the compliance chart at the inflator
   ============================================================ */

export const BALLOONS = {
  sc: { name: 'Semi-compliant 3.0 mm', nom: 8, rbp: 16, d0: 3.0, slope: 0.045, col: CY, use: 'Pre-dilatation: grows with pressure, conforms to the lesion.' },
  nc: { name: 'Non-compliant 3.5 mm', nom: 12, rbp: 20, d0: 3.5, slope: 0.012, col: GO, use: 'Post-dilatation inside a stent: high pressure, little growth — the size on the box is the size you get.' },
  cut: { name: 'Scoring / cutting 3.0 mm', nom: 6, rbp: 12, d0: 3.0, slope: 0.02, col: VI, use: 'Blades or wires focus force to crack fibrotic or calcified rings before stenting.' },
};
export const diaAt = (b, atm) => b.d0 + (atm - b.nom) * b.slope;

/** Inflate a balloon on its compliance chart; lock when the target diameter is reached safely. */
export function BalloonSim({ id, type = 'nc', target = 3.6, prompt }) {
  const { answers, answer } = useCase();
  const res = answers[id];
  const b = BALLOONS[type];
  const [atm, setAtm] = useState(0);
  const d = atm < 2 ? 0 : diaAt(b, atm);
  const burst = atm > b.rbp + 4;
  const ref = useRef(null);
  useCanvas(ref, 230, (g, w, h) => {
    g.fillStyle = '#050B16'; g.fillRect(0, 0, w, h);
    // chart
    const X = a => 50 + a / 26 * (w * 0.5 - 60), Y = dd => h - 30 - (dd - 2.6) / 1.4 * (h - 60);
    g.strokeStyle = 'rgba(148,180,214,0.18)'; g.font = '10px "JetBrains Mono"'; g.fillStyle = INK3;
    for (let a = 0; a <= 26; a += 4) { g.beginPath(); g.moveTo(X(a), Y(2.6)); g.lineTo(X(a), Y(4)); g.stroke(); g.fillText(a, X(a) - 4, h - 14); }
    for (let dd = 2.6; dd <= 4.01; dd += 0.2) { g.beginPath(); g.moveTo(X(0), Y(dd)); g.lineTo(X(26), Y(dd)); g.stroke(); g.fillText(dd.toFixed(1), 14, Y(dd) + 3); }
    g.fillText('atm →', X(24), h - 2); g.fillText('mm', 14, 20);
    for (const k of Object.keys(BALLOONS)) {
      const bb = BALLOONS[k];
      g.strokeStyle = bb.col; g.globalAlpha = k === type ? 1 : 0.25; g.lineWidth = k === type ? 2.5 : 1.5;
      g.beginPath(); for (let a = 2; a <= bb.rbp; a += 0.5) a === 2 ? g.moveTo(X(a), Y(diaAt(bb, a))) : g.lineTo(X(a), Y(diaAt(bb, a))); g.stroke();
      g.fillStyle = bb.col; g.fillRect(X(bb.nom) - 3, Y(diaAt(bb, bb.nom)) - 3, 6, 6);
    }
    g.globalAlpha = 1;
    g.strokeStyle = RD; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(X(b.rbp), Y(2.6)); g.lineTo(X(b.rbp), Y(4)); g.stroke(); g.setLineDash([]);
    g.fillStyle = RD; g.fillText('RBP', X(b.rbp) + 3, Y(3.95));
    g.strokeStyle = GR; g.setLineDash([2, 4]); g.beginPath(); g.moveTo(X(0), Y(target)); g.lineTo(X(26), Y(target)); g.stroke(); g.setLineDash([]);
    g.fillStyle = GR; g.fillText(`target ${target} mm`, X(0) + 4, Y(target) - 4);
    if (atm >= 2) { g.fillStyle = INK; g.beginPath(); g.arc(X(atm), Y(Math.min(4, d)), 5, 0, 7); g.fill(); }
    // the balloon in the stented vessel
    const vx = w * 0.56, vw = w * 0.4, cy = h / 2, vr = 3.4 / 2 * 26;
    g.fillStyle = 'rgba(220,38,38,0.35)'; g.fillRect(vx, cy - vr - 8, vw, 2 * vr + 16);
    g.strokeStyle = '#94A3B8'; g.lineWidth = 1.2;
    for (let x = vx + 20; x < vx + vw - 20; x += 10) { g.beginPath(); g.moveTo(x, cy - Math.max(d, 3.0) / 2 * 26); g.lineTo(x + 5, cy + Math.max(d, 3.0) / 2 * 26); g.stroke(); }
    if (burst) { g.fillStyle = RD; g.font = '700 14px "JetBrains Mono"'; g.fillText('💥 RUPTURE — pinhole jet, dissection risk', vx, cy + vr + 34); }
    else if (atm >= 2) { g.fillStyle = b.col; g.globalAlpha = 0.75; g.beginPath(); g.ellipse(vx + vw / 2, cy, vw / 2 - 14, d / 2 * 26, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    g.fillStyle = INK; g.font = '700 16px "JetBrains Mono"'; g.fillText(`${atm} atm → ${atm < 2 ? '—' : d.toFixed(2) + ' mm'}`, vx, 22);
  }, [atm, type, target]);
  const lock = () => answer(id, { atm, d });
  const pts = res ? (Math.abs(res.d - target) <= 0.06 && res.atm <= b.rbp ? 12 : res.atm > b.rbp ? 0 : 5) : null;
  const tgtAtm = Math.round(b.nom + (target - b.d0) / b.slope);
  return (
    <div className="cs-card tight">
      <p className="cs-q">🎈 {prompt || `Post-dilate the stent to ${target} mm with the ${b.name} balloon.`}</p>
      <canvas ref={ref} className="cs-canvas" style={{ height: 230 }} aria-label="Balloon compliance chart and balloon in the stent" />
      <label className="tb-slider"><span>🔧 Inflation device</span>
        <input type="range" min="0" max="26" value={atm} onChange={e => setAtm(+e.target.value)} disabled={!!res} aria-label="Inflation pressure in atmospheres" />
        <b>{atm} atm</b></label>
      <p className="cs-pts">{b.name}: nominal {b.nom} atm = {b.d0.toFixed(2)} mm · rated burst {b.rbp} atm. {b.use}</p>
      <div className="cs-row"><button className="cs-btn primary" disabled={!!res || atm < 2} onClick={lock}>🔒 Hold & deflate</button></div>
      {TEST && <span hidden data-atm={tgtAtm} />}
      {res && <p className="tb-fb">{pts === 12 ? '✅' : '⚠️'} {res.atm} atm → {res.d.toFixed(2)} mm (target {target}, RBP {b.rbp}). {res.atm > b.rbp ? 'Above rated burst pressure: 99.9% of balloons survive RBP — not what is above it.' : Math.abs(res.d - target) <= 0.06 ? 'On target, below RBP.' : 'Read the chart, not the label: the diameter depends on the pressure.'} → +{pts}/12</p>}
      <ScoreOnce id={id} pts={pts} max={12} />
    </div>
  );
}

export function BalloonStent() {
  return (
    <div className="cs-card tight">
      <svg viewBox="0 0 760 220" className="tb-illus" role="img" aria-label="Rapid-exchange balloon and drug-eluting stent anatomy">
        <text x="20" y="26" className="tb-h">🎈 Rapid-exchange balloon & 🧱 drug-eluting stent</text>
        <rect x="30" y="72" width="420" height="8" rx="4" fill="#64748B" />
        <circle cx="300" cy="76" r="6" fill={GO} /><text x="290" y="60" className="tb-t" fill={GO}>①</text>
        <path d="M450 76 C470 52 590 52 610 76 C590 100 470 100 450 76 Z" fill="rgba(34,211,238,0.35)" stroke={CY} />
        <rect x="470" y="73" width="6" height="6" fill="#E5E7EB" /><rect x="584" y="73" width="6" height="6" fill="#E5E7EB" />
        <text x="524" y="50" className="tb-t" fill={CY}>②</text><text x="590" y="110" className="tb-t">③</text>
        <path d="M610 76 L660 76" stroke="#E2E8F0" strokeWidth="2" />
        <g transform="translate(40 140)">
          {[...Array(14)].map((_, i) => <path key={i} d={`M${i * 26} 0 l13 18 l13 -18 M${i * 26} 50 l13 -18 l13 18`} stroke="#CBD5E1" strokeWidth="2.4" fill="none" />)}
          {[...Array(5)].map((_, i) => <path key={'c' + i} d={`M${13 + i * 78} 18 L${13 + i * 78} 32`} stroke="#CBD5E1" strokeWidth="2" />)}
          <rect x="0" y="-6" width="364" height="62" rx="6" fill="none" stroke="rgba(167,139,250,0.6)" strokeDasharray="4 4" />
        </g>
        <text x="420" y="172" className="tb-t" fill={VI}>④ stent</text>
      </svg>
      <Captions items={[
        ['① Rapid-exchange port', '~25 cm from the tip: the wire runs inside only the distal shaft, so one operator can exchange devices on a 180 cm wire.', GO],
        ['② Balloon', 'Folded around the shaft; inflated with contrast–saline through the hub to a set pressure.', CY],
        ['③ Markers', 'Radiopaque bands at each end = the working length — position by the markers, not the shaft.'],
        ['④ Drug-eluting stent', 'Struts 60–90 µm + connectors; a polymer (durable or biodegradable) releases sirolimus/everolimus/zotarolimus over weeks to months. Size to the distal reference; optimise with an NC balloon.', VI],
      ]} />
    </div>
  );
}

/* ============================================================
   7 · ROTATIONAL ATHERECTOMY — the burr
   ============================================================ */

const BURRS = [1.25, 1.5, 1.75, 2.0];
const burrFr = b => (b <= 1.5 ? 6 : b <= 1.75 ? 7 : 8);

export function BurrSizer({ id, artery = 3.0, guideFr = 6 }) {
  const ref = artery;
  const { answers, answer } = useCase();
  const pick = answers[id];
  const [hov, setHov] = useState(1.5);
  const b = pick ?? hov;
  const ratio = b / ref;
  const fits = burrFr(b) <= guideFr;
  const best = BURRS.filter(x => burrFr(x) <= guideFr && x / ref <= 0.6 && x / ref >= 0.4).pop();
  const pts = pick != null ? (pick === best ? 12 : fits && ratio <= 0.7 ? 5 : 0) : null;
  const cv = useRef(null);
  useCanvas(cv, 180, (g, w, h, t) => {
    g.fillStyle = '#050B16'; g.fillRect(0, 0, w, h);
    const cy = h / 2, k = 34;
    g.fillStyle = 'rgba(220,38,38,0.3)'; g.fillRect(20, cy - ref / 2 * k - 8, w - 40, ref * k + 16);
    g.fillStyle = '#E5E7EB'; for (let x = 60; x < w - 60; x += 8) { g.fillRect(x, cy - ref / 2 * k - 6, 5, 6); g.fillRect(x, cy + ref / 2 * k, 5, 6); }   // calcium
    const bx = 60 + ((t * 60) % (w - 140));
    g.fillStyle = '#FBBF24'; g.beginPath(); g.ellipse(bx, cy, b / 2 * k * 1.3, b / 2 * k, 0, 0, 7); g.fill();
    g.strokeStyle = '#92400E'; for (let i = 0; i < 6; i++) { const a = t * 30 + i; g.beginPath(); g.moveTo(bx + Math.cos(a) * 4, cy + Math.sin(a) * b / 2 * k); g.lineTo(bx + Math.cos(a) * 10, cy - Math.sin(a) * b / 2 * k * 0.6); g.stroke(); }
    g.strokeStyle = '#E2E8F0'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(20, cy); g.lineTo(w - 20, cy); g.stroke();
    g.fillStyle = INK; g.font = '700 13px "JetBrains Mono"'; g.fillText(`burr ${b} mm / artery ${ref} mm = ${ratio.toFixed(2)} · needs ${burrFr(b)} Fr`, 24, 20);
    g.fillStyle = ratio > 0.6 ? RD : GR; g.fillText(ratio > 0.6 ? 'ratio > 0.6: more slow-flow, perforation, burr entrapment' : 'ratio 0.4–0.6: modify the calcium, then balloon', 24, h - 10);
  }, [b, ref]);
  return (
    <div className="cs-card tight">
      <p className="cs-q">⚙️ Reference vessel {ref} mm, {guideFr} Fr guide. Choose the burr.</p>
      <canvas ref={cv} className="cs-canvas" style={{ height: 180 }} aria-label="Rotablator burr in a calcified artery" />
      <div className="cs-row" style={{ marginTop: 8 }}>{BURRS.map(x => <button key={x} className={'cs-chip' + (b === x ? ' on' : '')} disabled={pick != null} onMouseEnter={() => pick == null && setHov(x)} onClick={() => answer(id, x)}>{x} mm burr</button>)}</div>
      <p className="cs-pts">140 000–180 000 rpm · short runs (≤ 20–30 s) · avoid drops of more than ~5 000 rpm · pecking motion, never push.</p>
      {TEST && <span hidden data-burr={`${best} mm burr`} />}
      {pick != null && <p className="tb-fb">{pick === best ? '✅' : '⚠️'} {pick} mm: ratio {(pick / ref).toFixed(2)}{burrFr(pick) > guideFr ? `, does not fit a ${guideFr} Fr guide` : ''}. Start small (burr:artery 0.4–0.6) — rotablation is to modify calcium so a balloon can expand it, not to make the lumen. → +{pts}/12</p>}
      <ScoreOnce id={id} pts={pts} max={12} />
    </div>
  );
}

/* ============================================================
   8 · SUPPORT & CLOSURE — illustrations
   ============================================================ */

export function SupportDevices() {
  return (
    <div className="cs-card tight">
      <svg viewBox="0 0 780 270" className="tb-illus" role="img" aria-label="IABP, Impella and VA-ECMO compared">
        <text x="20" y="26" className="tb-h">🫀 Mechanical support — where each device sits</text>
        {['IABP', 'Impella', 'VA-ECMO'].map((n, i) => (
          <g key={n} transform={`translate(${30 + i * 255} 40)`}>
            <path d="M60 200 L60 80 C60 20 160 20 160 70 L160 220" fill="none" stroke="rgba(252,165,165,0.5)" strokeWidth="18" />
            <ellipse cx="60" cy="214" rx="34" ry="20" fill="rgba(225,29,72,0.35)" />
            <text x="60" y="219" textAnchor="middle" className="tb-t">LV</text>
            <text x="110" y="250" textAnchor="middle" className="tb-h">{n}</text>
          </g>
        ))}
        <rect x="183" y="110" width="14" height="110" rx="7" fill="rgba(34,211,238,0.6)" stroke={CY} />
        <path d="M345 236 C335 230 338 220 345 222" stroke={GO} strokeWidth="5" fill="none" />
        <path d="M345 222 L345 150" stroke={GO} strokeWidth="7" />
        <rect x="339" y="140" width="12" height="22" rx="3" fill={GO} />
        <path d="M345 150 L345 60 C345 40 400 40 430 60" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <circle cx="660" cy="130" r="24" fill="rgba(52,227,154,0.25)" stroke={GR} />
        <path d="M600 250 C620 200 640 170 640 150" stroke={RD} strokeWidth="4" fill="none" />
        <path d="M680 150 C690 190 700 220 695 250" stroke={GR} strokeWidth="4" fill="none" />
      </svg>
      <Captions items={[
        ['IABP', '30–50 mL balloon in the descending aorta, tip ~2 cm below the left subclavian. Inflates in diastole (↑ coronary perfusion), deflates before systole (↓ afterload). ~0.5 L/min.', CY],
        ['Impella', 'Axial-flow pump across the aortic valve: pulls blood from the LV and ejects it into the ascending aorta (2.5–5.5 L/min). Unloads the LV.', GO],
        ['VA-ECMO', 'Venous drainage → pump + oxygenator → femoral artery. Full circulatory and respiratory support — but raises LV afterload.', GR],
      ]} />
    </div>
  );
}

export function ClosureDevices() {
  return (
    <div className="cs-card tight">
      <svg viewBox="0 0 760 170" className="tb-illus" role="img" aria-label="Radial compression band and femoral closure devices">
        <text x="20" y="26" className="tb-h">🩹 Closing the hole</text>
        <rect x="30" y="60" width="200" height="56" rx="16" fill="rgba(56,189,248,0.25)" stroke="#38BDF8" />
        <ellipse cx="120" cy="88" rx="30" ry="18" fill="rgba(34,211,238,0.55)" /><circle cx="120" cy="88" r="4" fill={RD} />
        <text x="130" y="150" textAnchor="middle" className="tb-t">① radial band</text>
        <rect x="300" y="90" width="160" height="40" fill="rgba(244,63,94,0.25)" />
        <rect x="370" y="44" width="20" height="56" fill="#E5E7EB" opacity="0.5" />
        <rect x="350" y="128" width="60" height="6" rx="3" fill={GO} /><rect x="368" y="78" width="24" height="16" rx="4" fill="#D6D3D1" />
        <text x="380" y="160" textAnchor="middle" className="tb-t">② Angio-Seal</text>
        <rect x="520" y="90" width="200" height="40" fill="rgba(244,63,94,0.25)" />
        <path d="M600 92 C590 70 640 70 630 92" stroke="#38BDF8" strokeWidth="3" fill="none" />
        <path d="M600 92 L605 120 M630 92 L625 120" stroke="#38BDF8" strokeWidth="3" />
        <text x="620" y="160" textAnchor="middle" className="tb-t">③ Perclose</text>
      </svg>
      <Captions items={[
        ['① Radial band (TR Band)', 'An air bladder over the puncture. “Patent haemostasis”: the least air that stops bleeding while the artery stays open (check the pleth); deflate gradually.', '#38BDF8'],
        ['② Angio-Seal', 'An absorbable anchor inside the artery and a collagen plug outside, cinched together.', GO],
        ['③ Perclose ProGlide', 'A suture tied over the arteriotomy; “pre-close” before large-bore sheaths (TAVI, Impella).', CY],
      ]} />
    </div>
  );
}

/* ============================================================
   9 · INTRACORONARY IMAGING & PHYSIOLOGY — illustration
   ============================================================ */

export function ImagingPhysiology() {
  return (
    <div className="cs-card tight">
      <svg viewBox="0 0 780 180" className="tb-illus" role="img" aria-label="IVUS, OCT and pressure wire compared">
        <text x="20" y="26" className="tb-h">🔬 Seeing inside</text>
        {[['IVUS', 140, '#94A3B8'], ['OCT', 390, '#F5C451'], ['FFR / iFR wire', 640, '#34E39A']].map(([n, x, c]) => (
          <g key={n}>
            <circle cx={x} cy="96" r="54" fill="#0B1220" stroke={c} strokeWidth="2" />
            {n === 'IVUS' && <><circle cx={x} cy="96" r="44" fill="none" stroke="#475569" strokeWidth="8" /><circle cx={x - 6} cy="92" r="22" fill="#020617" /><path d={`M${x - 30} 76 a 32 32 0 0 1 40 -6`} stroke="#E5E7EB" strokeWidth="6" fill="none" /></>}
            {n === 'OCT' && <><circle cx={x} cy="96" r="30" fill="#020617" stroke="#FBBF24" strokeWidth="3" />{[...Array(10)].map((_, i) => <circle key={i} cx={x + 30 * Math.cos(i * 0.63)} cy={96 + 30 * Math.sin(i * 0.63)} r="2.5" fill="#E5E7EB" />)}</>}
            {n.includes('FFR') && <path d={`M${x - 46} 96 L${x - 20} 96 L${x - 10} 82 L${x} 96 L${x + 46} 96`} stroke={c} strokeWidth="3" fill="none" />}
            <text x={x} y="170" textAnchor="middle" className="tb-t" fill={c}>{n}</text>
          </g>
        ))}
      </svg>
      <Captions items={[
        ['IVUS', 'Ultrasound (20–60 MHz) sees through plaque to the vessel wall (EEM): sizes the vessel and the stent; no flush needed; ~100 µm resolution.', '#94A3B8'],
        ['OCT', 'Near-infrared light, ~10× sharper: thin caps, struts, dissections, thrombus — needs a contrast flush; shallow penetration.', GO],
        ['FFR / iFR wire', 'A pressure sensor 3 cm from the tip: Pd/Pa tells whether a lesion causes ischaemia. FFR ≤ 0.80 (hyperaemia), iFR ≤ 0.89 (rest).', GR],
      ]} />
    </div>
  );
}
